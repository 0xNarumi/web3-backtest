import { GLPData } from "./datasource/GmxDataSource.js"

type TokenSymbol = 'ETH' | 'BTC' | 'DAI'
type PriceFetcher = (token: TokenSymbol) => number

type Snapshot = {
	profit: number
	profitPercent: number
	positionBase: number
	positionQuote: number
	baseValueUsd: number
	quoteValueUsd: number
	quote: TokenSymbol
	base: TokenSymbol
	collateral: number
	long: boolean
	value: number
	borrowFee: number
	borrowFeePerHour: number
}

const POSITION_FEE = 0.001

// assumes collat is in USD
export class GMXPosition {
	public open: boolean = true
	public profit: number = 0
	public profitPercent: number = 0

	public positionBase: number
	public positionQuote: number
	public baseValueUsd: number
	public quoteValueUsd: number
	public lastSampleTime: number
	public borrowFee: number = 0
	public borrowFeePerHour: number = 0
	public borrowFeeSum = 0
	
	constructor(
		private fetchPrice: PriceFetcher,
		private quote: TokenSymbol,
		private base: TokenSymbol,
		private collateral: number, 
		private long: boolean,
		openLeverage: number,
		timestamp: number,
	) {
		const dir = (this.long ? 1 : -1)
		const size = collateral * openLeverage
		const fee = size * POSITION_FEE
		const basePrice = this.fetchPrice(this.base)
		const quotePrice = this.fetchPrice(this.quote)
		const price = basePrice / quotePrice
		this.positionBase = dir * (size) / price
		this.positionQuote = -dir * (size)
		this.profit = 0
		this.profitPercent = 0
		this.baseValueUsd = this.positionBase * basePrice
		this.quoteValueUsd = this.positionQuote * quotePrice
		this.lastSampleTime = timestamp
		this.collateral -= fee
	}

	public getUtilisation(data: GLPData, token: TokenSymbol) {
		switch (token) {
			case 'ETH': return data.ethUtilisation
			case 'BTC': return data.btcUtilisation
			default:
				throw new Error('Utilisation not support for token')
		}
	}

	public processSample(data: GLPData) {
		const dir = (this.long ? 1 : -1)
		const basePrice = this.fetchPrice(this.base)
		const quotePrice = this.fetchPrice(this.quote)
		this.baseValueUsd = this.positionBase * basePrice
		this.quoteValueUsd = this.positionQuote * quotePrice
		this.profit = this.baseValueUsd + this.quoteValueUsd
		this.profitPercent = this.profit / this.collateral


		// Calc borrow fee
		// Borrow fee per hour = (assets borrowed) / (total assets in pool) * 0.01%
		const hoursPassed = (data.timestamp - this.lastSampleTime) / (60 * 60)

		// ** WARNING - Assmumes a short position **
		this.borrowFeePerHour = this.getUtilisation(data, this.base) * 0.0001
		this.borrowFee = Math.abs(this.borrowFeePerHour * hoursPassed * this.baseValueUsd)
		this.borrowFeeSum += this.borrowFee
		// this.collateral -= this.borrowFee //
		this.lastSampleTime = data.timestamp
	}

	// Assumes a short position!!
	public adjustPosition(data: GLPData, newCollateral: number, newLeverage: number) {
		// Calc the fee
		const shortSizeDisired = newCollateral * newLeverage
		const shortSizeDiff = shortSizeDisired - ( -this.baseValueUsd ) 
		const fee = Math.abs(shortSizeDiff) * POSITION_FEE

		// Prices
		const basePrice = this.fetchPrice(this.base)
		const quotePrice = this.fetchPrice(this.quote)
		const price = basePrice / quotePrice

		// Update Position
		const dir = (this.long ? 1 : -1)
		this.collateral = newCollateral - fee
		this.positionBase = dir * (shortSizeDisired) / price
		this.positionQuote = -dir * (shortSizeDisired)
		this.profit = 0
		this.profitPercent = 0
		this.baseValueUsd = this.positionBase * basePrice
		this.quoteValueUsd = this.positionQuote * quotePrice	
		const borrowFeeSum = this.borrowFeeSum
		this.borrowFeeSum = 0	
		return borrowFeeSum // This fee needs to be covered elsewhere
	}

	public valueUsd() {
		return this.collateral + this.profit
	} 

	public get snapshot() {
		return {
			profit: this.profit,
			profitPercent: this.profitPercent,
			positionBase: this.positionBase,
			positionQuote: this.positionQuote,
			baseValueUsd: this.baseValueUsd,
			quoteValueUsd: this.quoteValueUsd,
			quote: this.quote,
			base: this.base,
			collateral: this.collateral,
			long: this.long,
			value: this.valueUsd(),
			borrowFee: this.borrowFee,
			borrowFeePerHour: this.borrowFeePerHour,
		}
	}
	
	public close() {
		this.open = false
	}

}

export class GMXPositionManager {
    lastData!: GLPData
	private positions: GMXPosition[] = []
	
	public update(data: GLPData): boolean {
		const isFirst = !this.lastData
		this.lastData = data
		for (const pos of this.positions) {
			if (pos.open) {
				pos.processSample(data)
			}
		}
		return isFirst
	}

	// Assumes collateral is in DAI
	public openShort(collateralDai: number, leverage: number, token: TokenSymbol) {
		const pos = new GMXPosition(this.getTokenPrice.bind(this), 'DAI', token, collateralDai, false, leverage, this.lastData.timestamp)
		this.positions.push(pos)
		return pos
	}

	private getTokenPrice(token: TokenSymbol) {
		switch (token) {
			case 'ETH': return this.lastData.ethPrice
			case 'BTC': return this.lastData.btcPrice
			case 'DAI': return 1
		}
	}
}