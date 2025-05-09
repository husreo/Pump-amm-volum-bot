import * as spl from "@solana/spl-token";
import { Market } from "@openbook-dex/openbook";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import * as structs from "./structs";
import { RayLiqPoolv4, connection, wallet } from "../src/config";
import { retryOperation } from "./utils";

const openbookProgram = new PublicKey("srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX");

async function getMarketInfo(marketId: PublicKey) {
	let reqs = 0;
	let marketInfo = await connection.getAccountInfo(marketId);
	reqs++;

	while (!marketInfo) {
		marketInfo = await connection.getAccountInfo(marketId);
		reqs++;
		if (marketInfo) {
			break;
		} else if (reqs > 20) {
			console.log(`Could not get market info..`);

			return null;
		}
	}

	return marketInfo;
}

async function getDecodedData(marketInfo: { executable?: boolean; owner?: PublicKey; lamports?: number; data: any; rentEpoch?: number | undefined }) {
	return Market.getLayout(openbookProgram).decode(marketInfo.data);
}

async function getMintData(mint: PublicKey) {
	return connection.getAccountInfo(mint);
}

async function getDecimals(mintData: AccountInfo<Buffer> | null) {
	if (!mintData) throw new Error("No mint data!");

	return structs.SPL_MINT_LAYOUT.decode(mintData.data).decimals;
}

async function getOwnerAta(mint: { toBuffer: () => Uint8Array | Buffer }, publicKey: PublicKey) {
	const foundAta = PublicKey.findProgramAddressSync([publicKey.toBuffer(), spl.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], spl.ASSOCIATED_TOKEN_PROGRAM_ID)[0];

	return foundAta;
}

function getVaultSigner(marketId: { toBuffer: any }, marketDeco: { vaultSignerNonce: { toString: () => any } }) {
	const seeds = [marketId.toBuffer()];
	const seedsWithNonce = seeds.concat(Buffer.from([Number(marketDeco.vaultSignerNonce.toString())]), Buffer.alloc(7));

	return PublicKey.createProgramAddressSync(seedsWithNonce, openbookProgram);
}

export async function derivePoolKeys(marketId: PublicKey): Promise<any> {
	const marketInfo = await retryOperation(() => getMarketInfo(marketId));
	if (!marketInfo) return null;

	const marketDeco = await retryOperation(() => getDecodedData(marketInfo));
	const { baseMint } = marketDeco;

	const baseMintData = await retryOperation(() => getMintData(baseMint));
	const baseDecimals = await retryOperation(() => getDecimals(baseMintData));

	const ownerBaseAta = await retryOperation(() => getOwnerAta(baseMint, wallet.publicKey));

	const { quoteMint } = marketDeco;
	const quoteMintData = await retryOperation(() => getMintData(quoteMint));
	const quoteDecimals = await retryOperation(() => getDecimals(quoteMintData));

	const ownerQuoteAta = await retryOperation(() => getOwnerAta(quoteMint, wallet.publicKey));

	const authority = PublicKey.findProgramAddressSync([Buffer.from("amm authority")], RayLiqPoolv4)[0];

	const marketAuthority = getVaultSigner(marketId, marketDeco);

	// get/derive all the pool keys
	const poolKeys = {
		keg: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
		version: 4,
		marketVersion: 3,
		programId: RayLiqPoolv4,
		baseMint,
		quoteMint,
		ownerBaseAta,
		ownerQuoteAta,
		baseDecimals,
		quoteDecimals,
		lpDecimals: baseDecimals,
		authority,
		marketAuthority,
		marketProgramId: openbookProgram,
		marketId,
		marketBids: marketDeco.bids,
		marketAsks: marketDeco.asks,
		marketQuoteVault: marketDeco.quoteVault,
		marketBaseVault: marketDeco.baseVault,
		marketEventQueue: marketDeco.eventQueue,
		id: PublicKey.findProgramAddressSync([RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from("amm_associated_seed", "utf-8")], RayLiqPoolv4)[0],
		baseVault: PublicKey.findProgramAddressSync([RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from("coin_vault_associated_seed", "utf-8")], RayLiqPoolv4)[0],
		coinVault: PublicKey.findProgramAddressSync([RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from("pc_vault_associated_seed", "utf-8")], RayLiqPoolv4)[0],
		lpMint: PublicKey.findProgramAddressSync([RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from("lp_mint_associated_seed", "utf-8")], RayLiqPoolv4)[0],
		lpVault: PublicKey.findProgramAddressSync([RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from("temp_lp_token_associated_seed", "utf-8")], RayLiqPoolv4)[0],
		targetOrders: PublicKey.findProgramAddressSync([RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from("target_associated_seed", "utf-8")], RayLiqPoolv4)[0],
		withdrawQueue: PublicKey.findProgramAddressSync([RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from("withdraw_associated_seed", "utf-8")], RayLiqPoolv4)[0],
		openOrders: PublicKey.findProgramAddressSync([RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from("open_order_associated_seed", "utf-8")], RayLiqPoolv4)[0],
		quoteVault: PublicKey.findProgramAddressSync([RayLiqPoolv4.toBuffer(), marketId.toBuffer(), Buffer.from("pc_vault_associated_seed", "utf-8")], RayLiqPoolv4)[0],
		lookupTableAccount: PublicKey.default,
	};

	return poolKeys;
}
