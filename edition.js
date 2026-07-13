/*
Fōrmulæ data package. Module for edition.
Copyright (C) 2015-2026 Laurence R. Ugalde

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

"use strict";

export class Data extends Formulae.Package {}

Data.setEditions = function() {
	Formulae.addEdition(this.messages.pathData, Formulae.icon("Data.CreateByteBuffer", 1), this.messages.leafCreateByteBuffer, () => Expression.wrapperEdition("Data.CreateByteBuffer"));
	
	// Extract from byte buffer
	
	[ 8, 16, 32, 64 ].forEach(size => {
		let mnemonic = Data.messages.mnemonicGetInteger + size;
		let name = Data.messages.nameGetInteger1 + size + Data.messages.nameGetInteger2;
		Formulae.addEdition(
			this.messages.pathExtraction,
			Formulae.icon("Data." + mnemonic, 2),
			name,
			() => Expression.multipleEdition("Data." + mnemonic, 2, 0)
		);
	});
	
	[ 32, 64 ].forEach(size => {
		let mnemonic = Data.messages.mnemonicGetFloat + size;
		let name = Data.messages.nameGetFloat1 + size + Data.messages.nameGetFloat2;
		Formulae.addEdition(
			this.messages.pathExtraction,
			Formulae.icon("Data." + mnemonic, 2),
			name,
			() => Expression.multipleEdition("Data." + mnemonic, 2, 0)
		);
	});
	
	// Update byte buffer
	
	[ 8, 16, 32, 64 ].forEach(size => {
		let mnemonic = Data.messages.mnemonicSetInteger + size;
		let name = Data.messages.nameSetInteger1 + size + Data.messages.nameSetInteger2;
		Formulae.addEdition(
			this.messages.pathUpdate,
			Formulae.icon("Data." + mnemonic, 3),
			name,
			() => Expression.multipleEdition("Data." + mnemonic, 3, 0)
		);
	});
	
	[ 32, 64 ].forEach(size => {
		let mnemonic = Data.messages.mnemonicSetFloat + size;
		let name = Data.messages.nameSetFloat1 + size + Data.messages.nameSetFloat2;
		Formulae.addEdition(
			this.messages.pathUpdate,
			Formulae.icon("Data." + mnemonic, 3),
			name,
			() => Expression.multipleEdition("Data." + mnemonic, 3, 0)
		);
	});
	
	// Conversion
	
	Formulae.addEdition(this.messages.pathToBytes, Formulae.icon("Data.StringToBytes", 1), this.messages.leafStringToBytes, () => Expression.wrapperEdition("Data.StringToBytes"));
	Formulae.addEdition(this.messages.pathToBytes, Formulae.icon("Data.Base64ToBytes", 1), this.messages.leafBase64ToBytes, () => Expression.wrapperEdition("Data.Base64ToBytes"));
	Formulae.addEdition(this.messages.pathToBytes, Formulae.icon("Data.HexToBytes", 1), this.messages.leafHexToBytes,    () => Expression.wrapperEdition("Data.HexToBytes"));
	Formulae.addEdition(this.messages.pathToBytes, Formulae.icon("Data.ArrayToBytes", 1), this.messages.leafArrayToBytes,  () => Expression.wrapperEdition("Data.ArrayToBytes"));
	
	Formulae.addEdition(this.messages.pathFromBytes, Formulae.icon("Data.BytesToString", 1), this.messages.leafBytesToString, () => Expression.wrapperEdition("Data.BytesToString"));
	Formulae.addEdition(this.messages.pathFromBytes, Formulae.icon("Data.BytesToBase64", 1), this.messages.leafBytesToBase64, () => Expression.wrapperEdition("Data.BytesToBase64"));
	Formulae.addEdition(this.messages.pathFromBytes, Formulae.icon("Data.BytesToHex", 1), this.messages.leafBytesToHex,    () => Expression.wrapperEdition("Data.BytesToHex"));
	Formulae.addEdition(this.messages.pathFromBytes, Formulae.icon("Data.BytesToArray", 1), this.messages.leafBytesToArray,  () => Expression.wrapperEdition("Data.BytesToArray"));
	
	
	// Options
	
	Formulae.addEdition(this.messages.pathSign, '<expression tag="Data.Sign.Unsigned"/>', this.messages.nameUnsigned, () => Expression.replacingEdition("Data.Sign.Unsigned"));
	Formulae.addEdition(this.messages.pathSign, '<expression tag="Data.Sign.Signed"/>', this.messages.nameSigned,   () => Expression.replacingEdition("Data.Sign.Signed"));
	
	Formulae.addEdition(this.messages.pathEndianness, '<expression tag="Data.Endianness.Little-endian"/>', this.messages["nameLittle-endian"], () => Expression.replacingEdition("Data.Endianness.Little-endian"));
	Formulae.addEdition(this.messages.pathEndianness, '<expression tag="Data.Endianness.Big-endian"/>', this.messages["nameBig-endian"],    () => Expression.replacingEdition("Data.Endianness.Big-endian"));
};
