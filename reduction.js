/*
Fōrmulæ data package. Module for reduction.
Copyright (C) 2015-2025 Laurence R. Ugalde

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

export class Data extends Formulae.Package {}

Data.createByteBuffer = async (createByteBuffer, session) => {
	let n = CanonicalArithmetic.getNativeInteger(createByteBuffer.children[0]);
	if (n === undefined || n < 0) {
		ReductionManager.setInError(createByteBuffer.children[0], "Invalid number");
		throw new ReductionError();
	};
	
	let arrayBuffer = new ArrayBuffer(n);
	
	let result = Formulae.createExpression("Data.ByteBuffer");
	result.set("Value", arrayBuffer);
	createByteBuffer.replaceBy(result);
	
	return true;
};

Data.stringToBytes = async (stringToBytes, session) => {
	let string = stringToBytes.children[0];
	if (string.getTag() !== "String.String") { 
		ReductionManager.setInError(stringToBytes.children[0], "Expression is not a string");
		throw new ReductionError();
	}
	string = string.get("Value");
	
	// let arrayBuffer = new TextEncoder().encode(string);
	
	let bytes = [];
	let charCode;
	
	for (let ii = 0; ii < string.length; ii++) {
		charCode = string.charCodeAt(ii);
		
		if (charCode < 0x80) {
			bytes.push(charCode);
		}
		else if (charCode < 0x800) {
			bytes.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
		}
		else if (charCode < 0xd800 || charCode >= 0xe000) {
			bytes.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
		}
		else {
			ii++;
			// Surrogate pair:
			// UTF-16 encodes 0x10000-0x10FFFF by subtracting 0x10000 and
			// splitting the 20 bits of 0x0-0xFFFFF into two halves
			charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (string.charCodeAt(ii) & 0x3ff));
			bytes.push(
				0xf0 |  (charCode >> 18),
				0x80 | ((charCode >> 12) & 0x3f),
				0x80 | ((charCode >>  6) & 0x3f),
				0x80 |  (charCode        & 0x3f),
			);
		}
	}
	
	let arrayBuffer = new Uint8Array(bytes).buffer;
	
	let result = Formulae.createExpression("Data.ByteBuffer");
	result.set("Value", arrayBuffer);
	stringToBytes.replaceBy(result);
	
	return true;
};

Data.bytesToString = async (bytesToString, session) => {
	let arrayBuffer = bytesToString.children[0];
	if (arrayBuffer.getTag() !== "Data.ByteBuffer") {
		ReductionManager.setInError(bytesToString.children[0], "Expression is not a byte buffer");
		throw new ReductionError();
	}
	arrayBuffer = arrayBuffer.get("Value");
	
	// let string = new TextDecoder().decode(arrayBuffer);
	
	// Thanks to Bob Arlof,https://stackoverflow.com/questions/8936984/uint8array-to-string-in-javascript 
	
	let charCache = new Array(128);  // Preallocate the cache for the common single byte chars
	let charFromCodePt = String.fromCodePoint || String.fromCharCode;
	let result = [];
		
	let codePoint, byte;
	let array = new Uint8Array(arrayBuffer);
	let length = array.length;
	
	result.length = 0;
	
	for (let i = 0; i < length;) {
		byte = array[i++];
		
		if (byte <= 0x7F) {
			codePoint = byte;
		}
		else if (byte <= 0xDF) {
			codePoint = ((byte & 0x1F) << 6) | (array[i++] & 0x3F);
		}
		else if (byte <= 0xEF) {
			codePoint = ((byte & 0x0F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F);
		}
		else if (String.fromCodePoint) {
			codePoint = ((byte & 0x07) << 18) | ((array[i++] & 0x3F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F);
		}
		else {
			codePoint = 63; // Cannot convert four byte code points, so use "?" instead
			i += 3;
		}
		
		result.push(charCache[codePoint] || (charCache[codePoint] = charFromCodePt(codePoint)));
	}
	
	// End thanks
	
	let string = result.join('');
		
	let stringExpr = Formulae.createExpression("String.String");
	stringExpr.set("Value", string);
	bytesToString.replaceBy(stringExpr);
	
	return true;
};

Data.base64ToBytes = async (base64ToBytes, session) => {
	let string = base64ToBytes.children[0];
	if (string.getTag() !== "String.String") {
		ReductionManager.setInError(base64ToBytes.children[0], "Expression is not a string");
		throw new ReductionError();
	}
	string = string.get("Value");
	
	let arrayBuffer;
	try {
		arrayBuffer = Utils.base64ToBytes(string).buffer;
	}
	catch (err) {
		ReductionManager.setInError(base64ToBytes.children[0], "Expression is not a valid Base64 string");
		throw new ReductionError();
	}
	
	let result = Formulae.createExpression("Data.ByteBuffer");
	result.set("Value", arrayBuffer);
	base64ToBytes.replaceBy(result);
	
	return true;
};

Data.bytesToBase64 = async (bytesToBase64, session) => {
	let arrayBuffer = bytesToBase64.children[0];
	if (arrayBuffer.getTag() !== "Data.ByteBuffer") {
		ReductionManager.setInError(bytesToBase64.children[0], "Expression is not a byte buffer");
		throw new ReductionError();
	}
	arrayBuffer = arrayBuffer.get("Value");
	let bytes = new Uint8Array(arrayBuffer);
	
	let string = Utils.bytesToBase64(bytes);
	
	let stringExpr = Formulae.createExpression("String.String");
	stringExpr.set("Value", string);
	bytesToBase64.replaceBy(stringExpr);
	
	return true;
};

Data.hexToBytes = async (hexToBytes, session) => {
	let string = hexToBytes.children[0];
	if (string.getTag() !== "String.String") {
		ReductionManager.setInError(hexToBytes.children[0], "Expression is not a string");
		throw new ReductionError();
	}
	string = string.get("Value");
	
	if ((string.length % 2) !== 0 || !(/^[0-9a-fA-F]*$/.test(string))) {
		ReductionManager.setInError(hexToBytes.children[0], "String has invalid characters");
		throw new ReductionError();
	}
	
	let arrayBuffer = new Uint8Array(string.match(/../g).map(ss => parseInt(ss, 16))).buffer;
	
	let result = Formulae.createExpression("Data.ByteBuffer");
	result.set("Value", arrayBuffer);
	hexToBytes.replaceBy(result);
	
	return true;
};

Data.bytesToHex = async (bytesToHex, session) => {
	let arrayBuffer = bytesToHex.children[0];
	if (arrayBuffer.getTag() !== "Data.ByteBuffer") {
		ReductionManager.setInError(bytesToHex.children[0], "Expression is not a byte buffer");
		throw new ReductionError();
	}
	arrayBuffer = arrayBuffer.get("Value");
	//let bytes= new Uint8Array(arrayBuffer);
	let bytes = [ ... new Uint8Array(arrayBuffer) ]; // WHY ???
	
	let string = bytes.map(x => x.toString(16).padStart(2, '0')).join('');
	
	let stringExpr = Formulae.createExpression("String.String");
	stringExpr.set("Value", string);
	bytesToHex.replaceBy(stringExpr);
	
	return true;
};

Data.arrayToBytes = async (arrayToBytes, session) => {
	let array = arrayToBytes.children[0];
	if (array.getTag() !== "List.List") {
		ReductionManager.setInError(arrayToBytes.children[0], "Expression is not a list");
		throw new ReductionError();
	}
	
	let unsigned = true;
	if (arrayToBytes.children.length >= 2) {
		switch (arrayToBytes.children[1].getTag()) {
			case "Data.Sign.Unsigned":
				unsigned = true;
				break;
			
			case "Data.Sign.Signed":
				unsigned = false;
				break;
			
			default:
				ReductionManager.setInError(arrayToBytes.children[1], "Expression is not a sign specification");
				throw new ReductionError();
		}
	}
	
	let n = array.children.length;
	let value;
	
	let arrayBuffer = new ArrayBuffer(n);
	let dataView = new DataView(arrayBuffer);
	
	for (let i = 0; i < n; ++i) {
		value = CanonicalArithmetic.getNativeInteger(array.children[i]);
		if (value === undefined) {
			ReductionManager.setInError(value, "Expression is not an integer number");
			throw new ReductionError();
		}
		
		if (unsigned) {
			dataView.setUint8(i, value);
		}
		else {
			dataView.setInt8(i, value);
		}
	}
	
	let result = Formulae.createExpression("Data.ByteBuffer");
	result.set("Value", arrayBuffer);
	arrayToBytes.replaceBy(result);
	
	return true;
};

Data.bytesToArray = async (bytesToArray, session) => {
	let arrayBuffer = bytesToArray.children[0];
	if (arrayBuffer.getTag() !== "Data.ByteBuffer") {
		ReductionManager.setInError(bytesToArray.children[0], "Expression is not byte buffer");
		throw new ReductionError();
	}
	arrayBuffer = arrayBuffer.get("Value");
	let dataView = new DataView(arrayBuffer);
	
	let unsigned = true;
	if (bytesToArray.children.length >= 2) {
		switch (bytesToArray.children[1].getTag()) {
			case "Data.Sign.Unsigned":
				unsigned = true;
				break;
			
			case "Data.Sign.Signed":
				unsigned = false;
				break;
			
			default:
				ReductionManager.setInError(bytesToArray.children[1], "Expression is not a sign specification");
				throw new ReductionError();
		}
	}
	
	let n = arrayBuffer.byteLength;
	let number;
	
	let result = Formulae.createExpression("List.List");
	
	for (let i = 0; i < n; ++i) {
		number = unsigned ? dataView.getUint8(i) : dataView.getInt8(i);
		result.addChild(
			CanonicalArithmetic.createInternalNumber(
				CanonicalArithmetic.createInteger(number, session),
				session
			)
		);
	}
	
	bytesToArray.replaceBy(result);
	return true;
};

Data.getNumber = async (getNumber, session) => {
	let arrayBuffer = getNumber.children[0];
	if (arrayBuffer.getTag() !== "Data.ByteBuffer") {
		ReductionManager.setInError(getNumber.children[0], "Expression is not byte buffer");
		throw new ReductionError();
	}
	arrayBuffer = arrayBuffer.get("Value");
	let dataView = new DataView(arrayBuffer);
	
	let pos = CanonicalArithmetic.getNativeInteger(getNumber.children[1]);
	if (pos === undefined) {
		ReductionManager.setInError(getNumber.children[1], "Expression is not an integer number");
		throw new ReductionError();
	}
	if (pos < 1 || pos > arrayBuffer.byteLength) {
		ReductionManager.setInError(getNumber.children[1], "Invalid index");
		throw new ReductionError();
	}
	
	let iSign, iEndianness;
	if (getNumber.getTag().includes("Integer")) {
		iSign = 2;
		iEndianness = 3;
	}
	else {
		iSign = -1;
		iEndianness = 2;
	}
	
	let unsigned = true;
	if (iSign > 0 && getNumber.children.length > iSign) {
		switch (getNumber.children[iSign].getTag()) {
			case "Data.Sign.Unsigned":
				unsigned = true;
				break;
			
			case "Data.Sign.Signed":
				unsigned = false;
				break;
			
			default:
				ReductionManager.setInError(getNumber.children[iSign], "Expression is not a sign specification");
				throw new ReductionError();
		}
	}
	
	let little = true;
	if (getNumber.children.length > iEndianness) {
		switch (getNumber.children[iEndianness].getTag()) {
			case "Data.Endianness.Little-endian":
				little = true;
				break;
			
			case "Data.Endianness.Big-endian":
				little = false;
				break;
			
			default:
				ReductionManager.setInError(getNumber.children[iEndianness], "Expression is not a endianness specification");
				throw new ReductionError();
		}
	}
	
	let result = Formulae.createExpression("List.List");
	let number;
	
	try {
		switch (getNumber.getTag()) {
			case "Data.GetInteger8":
				number = CanonicalArithmetic.createInteger(unsigned ? dataView.getUint8(pos - 1) : dataView.getInt8(pos - 1), session);
				result = CanonicalArithmetic.createInternalNumber(number, session);
				break;
			
			case "Data.GetInteger16":
				number = CanonicalArithmetic.createInteger(unsigned ? dataView.getUint16(pos - 1, little) : dataView.getInt16(pos - 1, little), session);
				result = CanonicalArithmetic.createInternalNumber(number, session);
				break;
			
			case "Data.GetInteger32":
				number = CanonicalArithmetic.createInteger(unsigned ? dataView.getUint32(pos - 1, little) : dataView.getInt32(pos - 1, little), session);
				result = CanonicalArithmetic.createInternalNumber(number, session);
				break;
			
			case "Data.GetInteger64":
				number = CanonicalArithmetic.createInteger(unsigned ? dataView.getBigUint64(pos - 1, little) : dataView.getBigInt64(pos - 1, little), session);
				result = CanonicalArithmetic.createInternalNumber(number, session);
				break;
			
			case "Data.GetFloat32":
				number = CanonicalArithmetic.createDecimal(dataView.getFloat32(pos - 1, little), session);
				result = CanonicalArithmetic.createInternalNumber(number, session);
				break;
			
			case "Data.GetFloat64":
				number = CanonicalArithmetic.createDecimal(dataView.getFloat64(pos - 1, little), session);
				result = CanonicalArithmetic.createInternalNumber(number, session);
				break;
		}
	}
	catch (err) {
		if (err instanceof RangeError) {
			ReductionManager.setInError(getNumber.children[1], "Invalid index");
			throw new ReductionError();
		}
	}
	
	getNumber.replaceBy(result);
	return true;
};

Data.setNumber = async (setNumber, session) => {
	// array buffer
	let arrayBuffer = setNumber.children[0];
	if (arrayBuffer.getTag() !== "Data.ByteBuffer") {
		ReductionManager.setInError(setNumber.children[0], "Expression is not byte buffer");
		throw new ReductionError();
	}
	arrayBuffer = arrayBuffer.get("Value");
	let dataView = new DataView(arrayBuffer);
	
	// pos
	let pos = CanonicalArithmetic.getInteger(setNumber.children[1]);
	if (pos === undefined) {
		ReductionManager.setInError(setNumber.children[1], "Expression is not an integer number");
		throw new ReductionError();
	}
	if (pos < 1 || pos > arrayBuffer.byteLength) {
		ReductionManager.setInError(setNumber.children[1], "Invalid index");
		throw new ReductionError();
	}
	
	// value
	
	//let value = CanonicalArithmetic.expr2CanonicalIntegerOrDecimal(setNumber.children[2]);
	//if (value === null) {
	//	ReductionManager.setInError(setNumber.children[2], "Expression is not a number");
	//	throw new ReductionError();
	//}
	
	let valueExpr = setNumber.children[2];
	if (!valueExpr.isInteralNumber()) {
		ReductionManager.setInError(valueExpr, "Expression is not a number");
		throw new ReductionError();
	}
	
	// sign, endianness
	let iSign, iEndianness;
	if (setNumber.getTag().includes("Integer")) {
		iSign = 3;
		iEndianness = 4;
	}
	else {
		iSign = -1;
		iEndianness = 3;
	}
	
	let unsigned = true;
	if (iSign > 0 && setNumber.children.length > iSign) {
		switch (setNumber.children[iSign].getTag()) {
			case "Data.Sign.Unsigned":
				unsigned = true;
				break;
			
			case "Data.Sign.Signed":
				unsigned = false;
				break;
			
			default:
				ReductionManager.setInError(setNumber.children[iSign], "Expression is not a sign specification");
				throw new ReductionError();
		}
	}
	
	let little = true;
	if (setNumber.children.length > iEndianness) {
		switch (setNumber.children[iEndianness].getTag()) {
			case "Data.Endianness.Little-endian":
				little = true;
				break;
			
			case "Data.Endianness.Big-endian":
				little = false;
				break;
			
			default:
				ReductionManager.setInError(setNumber.children[iEndianness], "Expression is not a endianness specification");
				throw new ReductionError();
		}
	}
	
	try {
		let value;
		
		switch (setNumber.getTag()) {
			case "Data.SetInteger8":
				//if (!(value instanceof CanonicalArithmetic.Integer)) return null;
				//unsigned ? dataView.setUint8(pos - 1, Number(value.integer)) : dataView.setInt8(pos - 1, Number(value));
				
				if ((value = CanonicalArithmetic.getNativeNumber(valueExpr)) === undefined) return false;
				unsigned ? dataView.setUint8(pos - 1, value) : dataView.setInt8(pos - 1, value);
				break;
			
			case "Data.SetInteger16":
				//if (!(value instanceof CanonicalArithmetic.Integer)) return null;
				//unsigned ? dataView.setUint16(pos - 1, Number(value.integer), little) : dataView.setInt16(pos - 1, Number(value), little);
				
				if ((value = CanonicalArithmetic.getNativeNumber(valueExpr)) === undefined) return false;
				unsigned ? dataView.setUint16(pos - 1, value, little) : dataView.setInt16(pos - 1, value, little);
				break;
			
			case "Data.SetInteger32":
				//if (!(value instanceof CanonicalArithmetic.Integer)) return null;
				//unsigned ? dataView.setUint32(pos - 1, Number(value.integer), little) : dataView.setInt32(pos - 1, Number(value), little);
				
				if ((value = CanonicalArithmetic.getNativeNumber(valueExpr)) === undefined) return false;
				unsigned ? dataView.setUint32(pos - 1, value, little) : dataView.setInt32(pos - 1, value, little);
				break;
			
			case "Data.SetInteger64":
				//if (!(value instanceof CanonicalArithmetic.Integer)) return null;
				//unsigned ? dataView.setBigUint64(pos - 1, value.integer, little) : dataView.setBigInt64(pos - 1, Number(value), little);
				
				if ((value = CanonicalArithmetic.getNativeBigInteger(valueExpr)) === undefined) return false;
				unsigned ? dataView.setBigUint64(pos - 1, value, little) : dataView.setBigInt64(pos - 1, value, little);
				break;
			
			case "Data.SetFloat32":
				//if (!(value instanceof CanonicalArithmetic.Decimal)) return null;
				//dataView.setFloat32(pos - 1, value.decimal.toNumber(), little);
				
				if ((value = CanonicalArithmetic.getNativeNumber(valueExpr)) === undefined) return false;
				dataView.setFloat32(pos - 1, value, little);
				break;
			
			case "Data.SetFloat64":
				//if (!(value instanceof CanonicalArithmetic.Decimal)) return null;
				//dataView.setFloat64(pos - 1, value.decimal.toNumber(), little);
				
				if ((value = CanonicalArithmetic.getNativeNumber(valueExpr)) === undefined) return false;
				dataView.setFloat64(pos - 1, value, little);
				break;
		}
	}
	catch (err) {
		if (err instanceof RangeError) {
			ReductionManager.setInError(setNumber.children[1], "Invalid index");
			throw new ReductionError();
		}
	}
	
	setNumber.replaceBy(setNumber.children[0]);
	return true;
};

Data.setReducers = () => {
	ReductionManager.addReducer("Data.CreateByteBuffer", Data.createByteBuffer, "Data.createByteBuffer");
	
	ReductionManager.addReducer("Data.StringToBytes", Data.stringToBytes, "Data.stringToBytes");
	ReductionManager.addReducer("Data.Base64ToBytes", Data.base64ToBytes, "Data.base64ToBytes");
	ReductionManager.addReducer("Data.HexToBytes",    Data.hexToBytes,    "Data.hexToBytes"   );
	ReductionManager.addReducer("Data.ArrayToBytes",  Data.arrayToBytes,  "Data.arrayToBytes" );
	
	ReductionManager.addReducer("Data.BytesToString", Data.bytesToString, "Data.bytesToString");
	ReductionManager.addReducer("Data.BytesToBase64", Data.bytesToBase64, "Data.bytesToBase64");
	ReductionManager.addReducer("Data.BytesToHex",    Data.bytesToHex,    "Data.bytesToHex"   );
	ReductionManager.addReducer("Data.BytesToArray",  Data.bytesToArray,  "Data.bytesToArray" );
	
	ReductionManager.addReducer("Data.GetInteger8",  Data.getNumber, "Data.getNumber");
	ReductionManager.addReducer("Data.GetInteger16", Data.getNumber, "Data.getNumber");
	ReductionManager.addReducer("Data.GetInteger32", Data.getNumber, "Data.getNumber");
	ReductionManager.addReducer("Data.GetInteger64", Data.getNumber, "Data.getNumber");
	ReductionManager.addReducer("Data.GetFloat32",   Data.getNumber, "Data.getNumber");
	ReductionManager.addReducer("Data.GetFloat64",   Data.getNumber, "Data.getNumber");
	
	ReductionManager.addReducer("Data.SetInteger8",  Data.setNumber, "Data.SetNumber");
	ReductionManager.addReducer("Data.SetInteger16", Data.setNumber, "Data.setNumber");
	ReductionManager.addReducer("Data.SetInteger32", Data.setNumber, "Data.setNumber");
	ReductionManager.addReducer("Data.SetInteger64", Data.setNumber, "Data.setNumber");
	ReductionManager.addReducer("Data.SetFloat32",   Data.setNumber, "Data.setNumber");
	ReductionManager.addReducer("Data.SetFloat64",   Data.setNumber, "Data.setNumber");
};
