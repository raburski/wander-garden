export function getCaptureDiff(captured, local, isEqual) {
    const newObjects = captured.filter(object => local.findIndex(l => l.id === object.id) === -1)
    const modifiedObjects = captured.filter(object => {
        const localObject = local.find(lObject => lObject.id === object.id)
        if (!localObject) { return false }
        if (isEqual(object, localObject)) { return false }
        return true
    })
    const unchangedObjects = captured.filter(object => {
        if (newObjects.findIndex(ns => ns.id === object.id) >= 0) { return false }
        if (modifiedObjects.findIndex(ms => ms.id === object.id) >= 0) { return false }
        return true
    })
    return {
        new: newObjects,
        modified: modifiedObjects,
        unchanged: unchangedObjects,
    }
}