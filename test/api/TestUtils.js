// @flow
import o from "ospec/ospec.js"

/**
 * Mocks an attribute (function or object) on an object and makes sure that it can be restored to the original attribute by calling unmockAttribute() later.
 * Additionally creates a spy for the attribute if the attribute is a function.
 * @param object The object on which the attribute exists.
 * @param attributeOnObject The attribute to mock.
 * @param attributeMock The attribute mock.
 * @returns An object to be passed to unmockAttribute() in order to restore the original attribute.
 */
export function mockAttribute(object: Object, attributeOnObject: Function | Object, attributeMock: Function | Object): Object {
	if (attributeOnObject == null) throw new Error("attributeOnObject is undefined")
	let attributeName = Object.getOwnPropertyNames(object).find(key => object[key] === attributeOnObject)
	if (!attributeName) {
		attributeName = Object.getOwnPropertyNames(Object.getPrototypeOf(object))
		                      .find(key => object[key] === attributeOnObject)
	}
	if (!attributeName) {
		throw new Error("attribute not found on object")
	}
	object[attributeName] = (typeof attributeOnObject == "function") ? o.spy(attributeMock) : attributeMock
	return {
		_originalObject: object,
		_originalAttribute: attributeOnObject,
		_attributeName: attributeName
	}
}

export function unmockAttribute(mock: Object) {
	mock._originalObject[mock._attributeName] = mock._originalAttribute
}

export function spy(producer?: (...any) => any): any {
	const invocations = []
	const s = (...args: any[]) => {
		invocations.push(args)
		return producer && producer(...args)
	}
	s.invocations = invocations
	return s
}


export const mock = <T>(obj: T, mocker: any => any): T => {
	mocker(obj)
	return obj
}

export function mapToObject<K, V>(map: Map<K, V>): {[K]: V} {
	const obj: {[K]: V} = {}
	map.forEach((value, key) => {
		obj[key] = value
	})
	return obj
}

export function mapObject<K, V, R>(mapper: (V) => R, obj: {[K]: V}): {[K]: R} {
	const newObj = {}
	for (let key of Object.keys(obj)) {
		newObj[key] = mapper(obj[key])
	}
	return newObj
}

export function replaceAllMaps(toReplace: any): any {
	return toReplace instanceof Map
		? replaceAllMaps(mapToObject(toReplace))
		: toReplace instanceof Array
			? toReplace.map(replaceAllMaps)
			: toReplace != null && Object.getPrototypeOf(toReplace) === (Object: any).prototype // plain object
				? mapObject(replaceAllMaps, toReplace)
				: toReplace
}