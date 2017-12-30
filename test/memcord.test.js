const assert = require('assert')
const { createMemcord } = require('../dist/commonjs/index')


describe('createMemcord', () => {
  it('returns a record', () => {
    const test = createMemcord({ a: 1, b: 2 })

    assert.equal(test.a, 1)
    assert.equal(test.b, 2)
    assert.equal(test.c, undefined)
  })

  it('freezes its return', () => {
    const test = createMemcord({ a: 1, b: 2 })

    test.a = 2
    assert.equal(test.a, 1)
  })
})


describe('Memcord', () => {
  describe('#set', () => {
    let memcord

    beforeEach(() => {
      memcord = createMemcord({ a: 'ORIGINAL_A', b: 'ORIGINAL_B' })
    })

    it('sets keys', () => {
      const memcordChangedOnce = memcord.set('a', 'CHANGED')
      assert.equal(memcordChangedOnce.a, 'CHANGED')
      assert.notEqual(memcord, memcordChangedOnce)

      const memcordChangedTwice = memcordChangedOnce.set('a', 'CHANGED_TWICE')
      assert.equal(memcordChangedTwice.a, 'CHANGED_TWICE')
    })

    it("uses existing record if value doesn't change", () => {
      const memcord2 = memcord.set('a', 'ORIGINAL_A')
      assert.equal(memcord, memcord2)
    })

    it("remembers the last set record", () => {
      const firstChange = memcord.set('a', 'CHANGED')
      assert.notEqual(memcord, firstChange)
      const changeAgain = memcord.set('a', 'CHANGED')
      assert.equal(firstChange, changeAgain)
    })

    it('throws when passed an unknown key', () => {
      assert.throws(function() {
        this.record.set('d', 'FAIL')
      })
    })
  })

  describe('#merge', () => {
    let memcord

    beforeEach(() =>  {
      memcord = createMemcord({ a: 'ORIGINAL_A', b: 'ORIGINAL_B' })
    })

    it('sets keys', () =>  {
      const firstChange = memcord.merge({ a: 'CHANGED_A', c: 'CHANGED_C' })
      assert.equal(firstChange.a, 'CHANGED_A')
      assert.equal(firstChange.b, 'ORIGINAL_B')
      assert.equal(firstChange.c, 'CHANGED_C')
      assert.notEqual(memcord, firstChange)

      const secondChange = firstChange.merge({ a: 'CHANGED_A', b: 'CHANGED_B' })
      assert.equal(secondChange.a, 'CHANGED_A')
      assert.equal(secondChange.b, 'CHANGED_B')
      assert.equal(secondChange.c, 'CHANGED_C')
    })

    it("uses existing record if value doesn't change", () =>  {
      const newRecord = memcord.merge({ b: 'ORIGINAL_B', a: 'ORIGINAL_A' })
      assert.equal(memcord, newRecord)
    })

    it("remembers the last set record", () =>  {
      const firstChange = memcord.merge({ a: 'CHANGED_A', c: 'CHANGED_C' })
      assert.notEqual(memcord, firstChange)
      const changeAgain = memcord.merge({ a: 'CHANGED_A', c: 'CHANGED_C' })
      assert.equal(firstChange, changeAgain)
    })

    it('can set unknown keys', () => {
      let newMemcord = memcord.merge({ d: 'NEW' })
      assert.equal(newMemcord.d, 'NEW')
      assert.notEqual(memcord, newMemcord)
    })
  })
})