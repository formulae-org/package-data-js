/*
Fōrmulæ data package. Module for edition.
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

Data.setEditions = function() {
	Formulae.addEdition(this.messages.pathToBytes,   null, this.messages.leafStringToBytes, () => Expression.wrapperEdition ("Data.StringToBytes"));
	Formulae.addEdition(this.messages.pathToBytes,   null, this.messages.leafBase64ToBytes, () => Expression.wrapperEdition ("Data.Base64ToBytes"));
	Formulae.addEdition(this.messages.pathToBytes,   null, this.messages.leafHexToBytes,    () => Expression.wrapperEdition ("Data.HexToBytes"));
	
	Formulae.addEdition(this.messages.pathFromBytes, null, this.messages.leafBytesToString, () => Expression.wrapperEdition ("Data.BytesToString"));
	Formulae.addEdition(this.messages.pathFromBytes, null, this.messages.leafBytesToBase64, () => Expression.wrapperEdition ("Data.BytesToBase64"));
	Formulae.addEdition(this.messages.pathFromBytes, null, this.messages.leafBytesToHex,    () => Expression.wrapperEdition ("Data.BytesToHex"));
};
