const fs = require('fs');
const OrderJsonFunction = (firstKey, secondKey) => (firstKey - secondKey)

const CheckSimilarity = class {
    constructor(data) {
        this.masterJson = JSON.parse(fs.readFileSync(data.masterFile, 'utf8'))
        this.compareJson = JSON.parse(fs.readFileSync(data.compareFile, 'utf8'))
        this.similarityPoints = {similarity: 0, total: 0}
    }

    orderJsonKeys(obj) {
        return Object.keys(obj).sort(OrderJsonFunction).reduce((accum, key) => {
            switch (typeof obj[key]) {
                case "object":
                    if (Array.isArray(obj[key])) {
                        accum[key] = obj[key].map(value => {
                            if (typeof value === 'object') return this.orderJsonKeys(value)
                            return value
                        })
                    } else {
                        if (obj[key] !== null) {
                            this.orderJsonKeys(obj[key])
                        } else {
                            accum[key] = null
                        }
                    }
                default:
                    accum[key] = obj[key]
            }
            return accum
        }, {})
    }

    sumPoints(firstVal, secondVal) {
        if (firstVal === secondVal) this.similarityPoints.similarity += 1
        this.similarityPoints.total += 1
    }

    compare(mainVal, valToCompare) {
        if (valToCompare) {
            // Get if is a object
            if (typeof valToCompare === "object") {
                if (Array.isArray(valToCompare)) {
                    //It's an array
                    valToCompare.forEach((valOfArr, index) => {
                        this.compare(valOfArr, mainVal[index])
                    })
                } else {
                    // It's an object
                    this.sumPoints(JSON.stringify(mainVal), JSON.stringify(valToCompare))
                }
            } else {
                // It's not obj so we compare values
                this.sumPoints(mainVal, valToCompare)
            }
        } else {
            this.similarityPoints.total += 1
        }
    }

    getSimilarity(data) {
        // data[0] will be always the masterFile and data[1] the compareFile
        // All results are going to be consider how different are data[1] from data[0]
        if (typeof data[0] !== typeof data[1]) return 0
        if (JSON.stringify(data[0]) === JSON.stringify(data[1])) return 1
        Object.keys(data[0]).forEach(key => {
            let mainVal = data[0][key]
            let valToCompare = data[1][key]
            this.compare(mainVal, valToCompare)
        })
        return this.similarityPoints.similarity / this.similarityPoints.total
    }

    getResult() {
        const orderedMasterJson = this.orderJsonKeys(this.masterJson)
        const orderedCompareJson = this.orderJsonKeys(this.compareJson)
        const result = this.getSimilarity([orderedMasterJson, orderedCompareJson])
        const resultVal = {resultValue: result.toFixed(2)}
        console.log('----------------------------------------------------------------')
        switch (result) {
            case 1:
                console.log({resultMsg: 'Are Similar', ...resultVal})
            case 0:
                console.log({resultMsg: 'Are different', ...resultVal})
            default:
                console.log({resultMsg: 'Have some similarities', ...resultVal})
        }
        console.log('----------------------------------------------------------------')
    }
}

module.exports = CheckSimilarity