memcord
=======

[![Version](http://img.shields.io/npm/v/memcord.svg)](https://www.npmjs.org/package/memcord)

Record objects that return reference-equal values when you repeat previous updates.

Install with `npm install memcord --save`.

```js
// Create a type of Record
const Model = createMemcord([ 'value', 'error' ])

// Create new record with the given values
const model = new Model({ value: 'koala' })

// Repeatedly setting the same value will return reference-equal objects.
const newRecord1 = model.set('value', 'kangaroo')
const newRecord2 = model.set('value', 'kangaroo')

console.log(newRecord1 === newRecord2) //true
```


Why?
----

In large React applications, being able to compare props via reference equality is a massive performance win. However, it can be difficult to compare reference equality of immutable objects, as each change results in a new object.

**Memcords make it easier to pass records as React props, by child components to easily update them while maintaining reference equality.**


Usage
-----


### `createMemcord(availableKeys)`

Define a record type by passing available keys to `createMemcord`

```js
import { createMemcord } from 'memcord'

const Model = createMemcord([
  'value'
  'error'
])


### `constructor(values)`

Create a record by calling `new`. Repeat it and get the same record.

```js
const data = new Model({ value: 'kangaroo' })

console.log(data.value)         // 'kangaroo'
console.log(data.error)         // undefined


const nextData = new Model({ value: 'kangaroo' })

console.log(nextData === data)  // true
```


### `set(key, value)`

Set values with `set`. Repeating the same `set` will return the same record.

```js
const newData1 = data.set('value', 'dropbear')

console.log(newData1.value)        // 'dropbear'
console.log(newData1 !== data)     // true


const newData2 = data.set('value', 'dropbear')

console.log(newData2.value)        // 'dropbear'
console.log(newData2 === newData1) // true
```


### `merge(values)`

You update multiple value at a time with `merge`.

```js
const merged1 = data.set({ value: 'giant koala', error: 'extinct' })

console.log(merged1.value)        // 'giant koala'
console.log(merged1.error)        // 'extinct'

const merged2 = data.set({ value: 'giant koala', error: 'extinct' })

console.log(merged1 === merged2)  // true
```


### Unknown keys

When `NODE_ENV` is not set to `production`, Memcord throws an exception if you try and set a key that wasn't passed to `createMemcord`.

```js
// Error
const fail = new Model({ unknown_key: 'Computer says no' })

// Error
data.set('unknown_key', 'Computer says no')

// Error
data.set({ value: 'ok', unknown_key: 'Computer says no' })
```
