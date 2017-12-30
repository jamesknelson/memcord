function referenceEquals(a: any, b: any): boolean {
    return a === b
}

/**
 * Create a Record that remembers values that you set for each property.
 * If you set the same value again, it will return the previous object.
 * 
 * This allows you to call `set` multiple times with the same value,
 * without worrying about breaking reference equality, which can come in
 * handy for passing "Bus" objects through React props.
 */
export function createMemcord<T extends object = any>(values?: T, equals?: (x: any, y: any) => boolean): Memcord<T>;
export function createMemcord<T extends object = any>(memcord: Memcord<T>): Memcord<T>;
export function createMemcord<T extends object = any>(valuesOrMemcord: any, equals = referenceEquals): Memcord<T> {
    return (
        (valuesOrMemcord instanceof MemcordBase)
            ? new MemcordBase(valuesOrMemcord.__values, valuesOrMemcord.__equals) as any
            : new MemcordBase(valuesOrMemcord || {}, equals) as any
    )
}

const memo = new WeakMap<MemcordBase, MemcordMemo<any>>()

type Memcord<T extends object = any> = Readonly<T> & {
    set: MemcordBase<T>['set']
    merge: MemcordBase<T>['merge']
}

type MemcordMemo<T extends object> = { [K in keyof T]?: { value: T[K], memcord: MemcordBase<T> } }

class MemcordBase<T extends object = any> {
    [name: string]: any;

    __equals: (x: any, y: any) => boolean;
    __values: T;

    /**
     * Create a new Memcord, without an empty memory.
     */
    constructor(values: T, equals: (x: any, y: any) => boolean) {
        memo.set(this, {})
        this.__values = values
        this.__equals = equals
        Object.assign(this, values)
        Object.freeze(this)
    }

    set<K extends keyof T>(key: K, value: T[K]): Memcord<T> {
        if (this.__equals(value, this[key])) {
            return this as any
        }
        else {
            // A value must exist on this map, as we set it in the constructor.
            const memcordMemo = memo.get(this) as MemcordMemo<T>
            const keyMemo = memcordMemo[key]
            if (keyMemo && this.__equals(keyMemo.value, value)) {
                return keyMemo.memcord as any
            }
            else {
                const memcord = new MemcordBase(Object.assign({}, this.__values, { [key]: value }), this.__equals)
                memcordMemo[key] = { value, memcord }
                return memcord as any
            }
        }
    }

    merge(values: Partial<T>): Memcord<T> {
        const keys = Object.keys(values).sort() as (keyof T)[]
        
        // Find values that differ from existing values
        const updatedKeys: (keyof T)[] = []
        for (let i=0; i<keys.length; i++) {
            const key = keys[i]
            const value = values[key]
            if (!this.__equals(this[key], value)) {
                updatedKeys.push(key)
            }
        }

        // If the changed values are identical to the previous changed
        // values, use the memoized version
        let result: Memcord<T> = this as any
        while (updatedKeys.length) {
            let key = updatedKeys.shift() as keyof T
            result = result.set(key, values[key])
        }
        return result
    }
}
