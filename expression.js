/*
Fōrmulæ data package. Module for expression definition & visualization.
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

Data.ByteBuffer = class extends Expression.Literal {
	getTag()  { return "Data.ByteBuffer"; }
	getName() { return Data.messages.nameByteBuffer; }
	
	set(name, value) {
		switch (name) {
			case "Value":
				this.arrayBuffer = value;
				return;
		}
		
		super.set(name, value);
	}
	
	get(name) {
		switch (name) {
			case "Value":
				return this.arrayBuffer;
		}
		
		return super.get(name);
	}
	
	getSerializationNames() {
		return [ "Value" ];
	}
	
	async getSerializationStrings() {
		//return [ new Uint8Array(this.arrayBuffer).join(" ")];
		return [ Utils.bytesToBase64(new Uint8Array(this.arrayBuffer)) ];
	}
	
	setSerializationStrings(strings, promises) {
		//this.arrayBuffer = new Uint8Array(strings[0].split(" ").map(x => Number(x))).buffer;
		this.arrayBuffer = Utils.base64ToBytes(strings[0]).buffer;
	}
	
	getLiteral() {
		let n = this.arrayBuffer === undefined ? 0 : this.arrayBuffer.byteLength;
		return "<" + n + " bytes>" 
	}
}

Data.setExpressions = function(module) {
	Formulae.setExpression(module, "Data.ByteBuffer", Data.ByteBuffer);
	
	// functions 1-parameter
	[
		"CreateByteBuffer",
		"StringToBytes", "BytesToString",
		"Base64ToBytes", "BytesToBase64",
		"HexToBytes",    "BytesToHex",
	].forEach(
		tag => Formulae.setExpression(module, "Data." + tag, {
			clazz:        Expression.Function,
			getTag:       () => "Data." + tag,
			getMnemonic:  () => Data.messages["mnemonic" + tag],
			getName:      () => Data.messages["name" + tag],
			getChildName: index => Data.messages["child" + tag],
			min:          1,
			max:          1
		})
	);
	
	[
		"ArrayToBytes", "BytesToArray",
	].forEach(
		tag => Formulae.setExpression(module, "Data." + tag, {
			clazz:        Expression.Function,
			getTag:       () => "Data." + tag,
			getMnemonic:  () => Data.messages["mnemonic" + tag],
			getName:      () => Data.messages["name" + tag],
			getChildName: index => Data.messages["children" + tag][index],
			min:          1,
			max:          2
		})
	);
	
	// GET
	
	[
		[  8, 3 ],
		[ 16, 4 ],
		[ 32, 4 ],
		[ 64, 4 ],
	].forEach(
		row => {
			let mnemonic = Data.messages.mnemonicGetInteger + row[0];
			let name = Data.messages.nameGetInteger1 + row[0] + Data.messages.nameGetInteger2;
			Formulae.setExpression(
				module,
				"Data." + mnemonic,
				{
					clazz:        Expression.Function,
					getTag:       () => "Data." + mnemonic,
					getMnemonic:  () => mnemonic,
					getName:      () => name,
					getChildName: index => Data.messages.childrenGetInteger[index],
					min:          2,
					max:          row[1]
				}
			);
		}
	);
	
	[ 32, 64 ].forEach(
		size => {
			let mnemonic = Data.messages.mnemonicGetFloat + size;
			let name = Data.messages.nameGetFloat1 + size + Data.messages.nameGetFloat2;
			Formulae.setExpression(
				module,
				"Data." + mnemonic,
				{
					clazz:        Expression.Function,
					getTag:       () => "Data." + mnemonic,
					getMnemonic:  () => mnemonic,
					getName:      () => name,
					getChildName: index => Data.messages.childrenGetFloat[index],
					min:          2,
					max:          3
				}
			);
		}
	);
	
	// SET
	
	[
		[  8, 4 ],
		[ 16, 5 ],
		[ 32, 5 ],
		[ 64, 5 ],
	].forEach(
		row => {
			let mnemonic = Data.messages.mnemonicSetInteger + row[0];
			let name = Data.messages.nameSetInteger1 + row[0] + Data.messages.nameSetInteger2;
			Formulae.setExpression(
				module,
				"Data." + mnemonic,
				{
					clazz:        Expression.Function,
					getTag:       () => "Data." + mnemonic,
					getMnemonic:  () => mnemonic,
					getName:      () => name,
					getChildName: index => Data.messages.childrenSetInteger[index],
					min:          3,
					max:          row[1]
				}
			);
		}
	);
	
	[ 32, 64 ].forEach(
		size => {
			let mnemonic = Data.messages.mnemonicSetFloat + size;
			let name = Data.messages.nameSetFloat1 + size + Data.messages.nameSetFloat2;
			Formulae.setExpression(
				module,
				"Data." + mnemonic,
				{
					clazz:        Expression.Function,
					getTag:       () => "Data." + mnemonic,
					getMnemonic:  () => mnemonic,
					getName:      () => name,
					getChildName: index => Data.messages.childrenSetFloat[index],
					min:          3,
					max:          4
				}
			);
		}
	);
	
	// Options
	
	[
		[ "Sign",       "Unsigned"     ],
		[ "Sign",       "Signed"       ],
		[ "Endianness", "Little-endian"],
		[ "Endianness", "Big-endian"   ],
	].forEach(
		row => Formulae.setExpression(
			module,
			"Data." + row[0] + "." + row[1],
			{
				clazz:    Expression.LabelExpression,
				getTag:   () => "Data." + row[0] + "." + row[1],
				getLabel: () => Data.messages["name" + row[1]],
				getName:  () => Data.messages["name" + row[1]]
			}
		)
	);
}
