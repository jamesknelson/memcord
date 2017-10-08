import assert from 'assert'

import { createMemcord } from '../src/index.mjs'

describe('Memcord', function() {
  describe('#constructor', function() {
    it('returns a record', function() {
      const Test = createMemcord(['a', 'b', 'c'])
      const test = new Test({ a: 1, b: 2 })

      assert.equal(test.a, 1)
      assert.equal(test.b, 2)
      assert.equal(test.c, undefined)
    })

    it('freezes its return', function() {
      const Test = createMemcord(['a', 'b', 'c'])
      const test = new Test({ a: 1, b: 2 })

      assert.throws(function() {
        test.a = 2
      })
    })

    it('remembers the last created record', function() {
      const Test = createMemcord(['a', 'b', 'c'])

      const record1 = new Test({ a: 1, b: 2 })
      const record2 = new Test({ a: 1, b: 2 })
      assert.equal(record1, record2)
    })

    it('throws when passed an unknown key', function() {
      const Test = createMemcord(['a', 'b'])

      assert.throws(function() {
        const test = new Test({ a: 1, c: 2 })
      })
    })
  })

  describe('#set', function() {
    beforeEach(function() {
      const Test = createMemcord(['a', 'b', 'c'])
      this.record = new Test({ a: 'ORIGINAL_A', b: 'ORIGINAL_B' })
    })

    it('sets known keys', function() {
      const firstChange = this.record.set('a', 'CHANGED')
      assert.equal(firstChange.a, 'CHANGED')
      assert.notEqual(this.record, firstChange)

      const secondChange = firstChange.set('a', 'CHANGED_TWICE')
      assert.equal(secondChange.a, 'CHANGED_TWICE')
    })

    it("uses existing record if value doesn't change", function() {
      const newRecord = this.record.set('a', 'ORIGINAL_A')
      assert.equal(this.record, newRecord)
    })

    it("remembers the last set record", function() {
      const firstChange = this.record.set('a', 'CHANGED')
      assert.notEqual(this.record, firstChange)
      const changeAgain = this.record.set('a', 'CHANGED')
      assert.equal(firstChange, changeAgain)
    })

    it('throws when passed an unknown key', function() {
      assert.throws(function() {
        this.record.set('d', 'FAIL')
      })
    })
  })

  describe('#merge', function() {
    beforeEach(function() {
      const Test = createMemcord(['a', 'b', 'c'])
      this.record = new Test({ a: 'ORIGINAL_A', b: 'ORIGINAL_B' })
    })

    it('sets known keys', function() {
      const firstChange = this.record.merge({ a:  'CHANGED_A', c: 'CHANGED_C' })
      assert.equal(firstChange.a, 'CHANGED_A')
      assert.equal(firstChange.b, 'ORIGINAL_B')
      assert.equal(firstChange.c, 'CHANGED_C')
      assert.notEqual(this.record, firstChange)

      const secondChange = firstChange.merge({ a: 'CHANGED_A', b: 'CHANGED_B' })
      assert.equal(secondChange.a, 'CHANGED_A')
      assert.equal(secondChange.b, 'CHANGED_B')
      assert.equal(secondChange.c, 'CHANGED_C')
    })

    it("uses existing record if value doesn't change", function() {
      const newRecord = this.record.merge({ a: 'ORIGINAL_A', b: 'ORIGINAL_B' })
      assert.equal(this.record, newRecord)
    })

    it("remembers the last set record", function() {
      const firstChange = this.record.merge({ a:  'CHANGED_A', c: 'CHANGED_C' })
      assert.notEqual(this.record, firstChange)
      const changeAgain = this.record.merge({ a:  'CHANGED_A', c: 'CHANGED_C' })
      assert.equal(firstChange, changeAgain)
    })

    it('throws when passed an unknown key', function() {
      assert.throws(function() {
        this.record.merge({ d: 'FAIL' })
      })
    })
  })
})