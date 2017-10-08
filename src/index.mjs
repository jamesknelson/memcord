/**
 * Create a Record that remembers values that you set for each property.
 * If you set the same value again, it will return the previous object.
 *
 * In development mode, if you try to set any unknown keys, an exception will
 * be thrown.
 */
export function createMemcord(allowedKeys, displayName='<unnamed record>') {
    const setMemos = new WeakMap
    const mergeMemos = new WeakMap

    let constructorMemo

    return class Memcord {
        constructor(values) {
            if (process.env.NODE_ENV !== 'production') {
                const keys = Object.keys(values)
                for (let i=0; i<keys.length; i++) {
                    const key = keys[i]
                    if (!allowedKeys.includes(key)) {
                        throw new Error(`shallow-record: You tried to use the unknown key "${key}" in "${displayName}".`)
                    }
                }
            }

            if (constructorMemo && valuesEquals(values, constructorMemo.values)) {
                return constructorMemo.record
            }
            else {
                constructorMemo = { values, record: this }
            }

            setMemos.set(this, {})
            mergeMemos.set(this, {})

            Object.assign(this, values)
            Object.freeze(this)
        }

        set(key, value) {
            if (process.env.NODE_ENV !== 'production') {
                if (!allowedKeys.includes(key)) {
                    throw new Error(`shallow-record: You tried to use the unknown key "${key}" in "${displayName}".`)
                }
            }

            if (value === this[key]) {
                return this
            }
            else {
                const memo = setMemos.get(this)
                const memoized = memo[key]
                if (memoized && memoized.value === value) {
                    return memoized.record
                }
                else {
                    const record = new Memcord(Object.assign({}, this, { [key]: value }))
                    memo[key] = { value, record }
                    return record
                }
            }
        }

        merge(values) {
            const keys = Object.keys(values)

            if (process.env.NODE_ENV !== 'production') {
                for (let i=0; i<keys.length; i++) {
                    const key = keys[i]
                    if (!allowedKeys.includes(key)) {
                        throw new Error(`shallow-record: You tried to use the unknown key "${key}" in "${displayName}".`)
                    }
                }
            }

            // Find values that differ from existing values
            let hasUpdatedValues = false
            const updatedValues = {}
            for (let i=0; i<keys.length; i++) {
                const key = keys[i]
                const value = values[key]
                if (this[key] !== value) {
                    updatedValues[key] = value
                    hasUpdatedValues = true
                }
            }

            if (!hasUpdatedValues) {
                return this
            }

            // If the changed values are identical to the previous changed
            // values, use the memoized version
            const memo = mergeMemos.get(this)
            if (memo && valuesEquals(memo.updatedValues, updatedValues)) {
                return memo.record
            }

            const record = new Memcord(Object.assign({}, this, updatedValues))
            mergeMemos.set(this, { updatedValues, record })
            return record
        }
    }
}

function valuesEquals(a, b) {
    var ka = 0
    var kb = 0

    for (var key in a) {
        if (
            a.hasOwnProperty(key) &&
            a[key] !== b[key]
        ) return false

        ka++
    }

    for (var key in b) {
        if (b.hasOwnProperty(key)) kb++
    }

    return ka === kb
}
