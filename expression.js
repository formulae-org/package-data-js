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
	//getName() { return Data.messages.nameByteBuffer; }
	getName() { return "Byte buffer"; }
	
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
	
	getSerializationStrings() {
		return [ new Uint8Array(this.arrayBuffer).join(" ")];
	}
	
	setSerializationStrings(strings, promises) {
		this.arrayBuffer = new Uint8Array(strings[0].split(" ").map(x => Number(x))).buffer;
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
	
	/*
	[ // functions
		[ "BytesToArray8",  1, 2 ],
		[ "BytesToArray16", 1, 3 ],
		[ "BytesToArray32", 1, 3 ],
	].forEach(row => Formulae.setExpression(module, "Data." + row[0], {
		clazz:        Expression.Function,
		getTag:       () => "Data." + row[0],
		getMnemonic:  () => Data.messages["mnemonic" + row[0]],
		getName:      () => Data.messages["name" + row[0]],
		getChildName: index => Data.messages["children" + row[0]][index],
		min:          row[1],
		max:          row[2]
	}));
	*/
}
