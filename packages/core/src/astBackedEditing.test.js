import * as s from './astBackedEditing'

test('getMetaData', () => {
    expect(s.getMetaData({
        customId:'5',
        foo:'bar'
    })).toEqual({
        title:'node-5'
    })
})
