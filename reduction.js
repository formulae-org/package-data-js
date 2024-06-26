/*
Fōrmulæ data package. Module for reduction.
Copyright (C) 2015-2023 Laurence R. Ugalde

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
	let n = CanonicalArithmetic.getInteger(createByteBuffer.children[0]);
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
			charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff));
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

// Thanks to https://gist.github.com/enepomnyaschih

const base64abc = [
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
	"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
	"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
	"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"
];

const base64codes = [
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,  62, 255, 255, 255,  63,
	 52,  53,  54,  55,  56,  57,  58,  59,  60,  61, 255, 255, 255,   0, 255, 255,
	255,   0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,
	 15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25, 255, 255, 255, 255, 255,
	255,  26,  27,  28,  29,  30,  31,  32,  33,  34,  35,  36,  37,  38,  39,  40,
	 41,  42,  43,  44,  45,  46,  47,  48,  49,  50,  51
];

function getBase64Code(charCode) {
	if (charCode >= base64codes.length) {
		throw new Error("Unable to parse base64 string.");
	}
	const code = base64codes[charCode];
	if (code === 255) {
		throw new Error("Unable to parse base64 string.");
	}
	return code;
}

/**
	input:  Uint8Array
	output: String
 */

Data._bytesToBase64 = bytes => {
	let result = '';
	let i;
	let l = bytes.length;
	
	for (i = 2; i < l; i += 3) {
		result += base64abc[  bytes[i - 2]         >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i    ] >> 6)];
		result += base64abc[  bytes[i    ] & 0x3F];
	}
	
	if (i === l + 1) { // 1 octet yet to write
		result += base64abc[ bytes[i - 2]         >> 2];
		result += base64abc[(bytes[i - 2] & 0x03) << 4];
		result += "==";
	}
	
	if (i === l) { // 2 octets yet to write
		result += base64abc[  bytes[i - 2]         >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[( bytes[i - 1] & 0x0F) << 2];
		result += "=";
	}
	
	return result;
};

/**
	input: String
	output: Uint8Array
	throws: Error if input is not a Base64 string
 */

Data._base64ToBytes = string => {
	if (string.length % 4 !== 0) {
		throw new Error("Unable to parse base64 string.");
	}
	
	const index = string.indexOf("=");
	
	if (index !== -1 && index < string.length - 2) {
		throw new Error("Unable to parse base64 string.");
	}
	
	let missingOctets = string.endsWith("==") ? 2 : string.endsWith("=") ? 1 : 0;
	let n = string.length;
	let len = 3 * (n / 4) - missingOctets;
	let result = new Uint8Array(len);
	let buffer;
	
	for (let i = 0, j = 0; i < n; i += 4, j += 3) {
		buffer =
			getBase64Code(string.charCodeAt(i    )) << 18 |
			getBase64Code(string.charCodeAt(i + 1)) << 12 |
			getBase64Code(string.charCodeAt(i + 2)) <<  6 |
			getBase64Code(string.charCodeAt(i + 3))
		;
		
		result[j] =  buffer >> 16;
		if (j + 1 < len) result[j + 1] = (buffer >> 8) & 0xFF;
		if (j + 2 < len) result[j + 2] =  buffer       & 0xFF;
	}
	
	return result;
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
		arrayBuffer = Data._base64ToBytes(string).buffer;
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
	
	let string = Data._bytesToBase64(bytes);
	
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
		value = CanonicalArithmetic.getInteger(array.children[i]);
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
		result.addChild(CanonicalArithmetic.number2InternalNumber(number, false, session));
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
	
	let pos = CanonicalArithmetic.getInteger(getNumber.children[1]);
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
				number = unsigned ? dataView.getUint8(pos - 1) : dataView.getInt8(pos - 1);
				result = CanonicalArithmetic.number2InternalNumber(number, false, session);
				break;
			
			case "Data.GetInteger16":
				number = unsigned ? dataView.getUint16(pos - 1, little) : dataView.getInt16(pos - 1, little);
				result = CanonicalArithmetic.number2InternalNumber(number, false, session);
				break;
			
			case "Data.GetInteger32":
				number = unsigned ? dataView.getUint32(pos - 1, little) : dataView.getInt32(pos - 1, little);
				result = CanonicalArithmetic.number2InternalNumber(number, false, session);
				break;
			
			case "Data.GetInteger64":
				number = unsigned ? dataView.getBigUint64(pos - 1, little) : dataView.getBigInt64(pos - 1, little);
				result = CanonicalArithmetic.bigInt2Expr(number);
				break;
			
			case "Data.GetFloat32":
				number = dataView.getFloat32(pos - 1, little);
				result = CanonicalArithmetic.number2InternalNumber(number, true, session);
				break;
			
			case "Data.GetFloat64":
				number = dataView.getFloat64(pos - 1, little);
				result = CanonicalArithmetic.number2InternalNumber(number, true, session);
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
	let value = CanonicalArithmetic.expr2CanonicalIntegerOrDecimal(setNumber.children[2]);
	if (value === null) {
		ReductionManager.setInError(setNumber.children[2], "Expression is not a number");
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
		switch (setNumber.getTag()) {
			case "Data.SetInteger8":
				if (!(value instanceof CanonicalArithmetic.Integer)) return null;
				unsigned ? dataView.setUint8(pos - 1, Number(value.integer)) : dataView.setInt8(pos - 1, Number(value));
				break;
			
			case "Data.SetInteger16":
				if (!(value instanceof CanonicalArithmetic.Integer)) return null;
				unsigned ? dataView.setUint16(pos - 1, Number(value.integer), little) : dataView.setInt16(pos - 1, Number(value), little);
				break;
			
			case "Data.SetInteger32":
				if (!(value instanceof CanonicalArithmetic.Integer)) return null;
				unsigned ? dataView.setUint32(pos - 1, Number(value.integer), little) : dataView.setInt32(pos - 1, Number(value), little);
				break;
			
			case "Data.SetInteger64":
				if (!(value instanceof CanonicalArithmetic.Integer)) return null;
				unsigned ? dataView.setBigUint64(pos - 1, value.integer, little) : dataView.setBigInt64(pos - 1, Number(value), little);
				break;
			
			case "Data.SetFloat32":
				if (!(value instanceof CanonicalArithmetic.Decimal)) return null;
				dataView.setFloat32(pos - 1, value.decimal.toNumber(), little);
				break;
			
			case "Data.SetFloat64":
				if (!(value instanceof CanonicalArithmetic.Decimal)) return null;
				dataView.setFloat64(pos - 1, value.decimal.toNumber(), little);
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
