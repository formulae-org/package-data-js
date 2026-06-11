# package-data-js

Data package for [Fōrmulæ](https://formulae.org) — the visual environment for **computing**, **composing**, and **conversing** with tree-structured expressions.

This repository contains the source code for the **data package**. It is intended for the conversion between byte buffers and arbitrary strings, Base64 strings, hexadecimal strings, etc.

> Part of the [formulae-org](https://github.com/formulae-org) organization: the [web application](https://github.com/formulae-org/formulae-js) plus one repository per package.

### Capabilities ###

#### The **Byte buffer** expression

The byte buffer expression is a collecion of raw bytes.

#### Creation ####

* Creation of a byte buffer of a given size (number of bytes) with zero values.

#### Conversions ####

* Conversion from/to a byte buffer to/from an arbitrary string. Unicode strings are supported.
* Conversion from/to a byte buffer to/from a Base64 string.
* Conversion from/to a byte buffer to/from a hexadecimal string.
* Conversion from/to a byte buffer to/from an array of integers.

#### Extraccion of data from a byte buffer ####

* Exraction of an integer-8 (a byte) from a given position, and optional signing specification
* Exraction of an integer-16 (usually known in other languages as *short int*) from a given position, and optional signing and endianness
* Exraction of an integer-32 (usually known in other languages as *int*) from a given position, and optional signing and endianness
* Exraction of an integer-64 (usually known in other languages as *long int*) from a given position, and optional signing and endianness
* Exraction of a float-32 (usually known in other languages as *float*) from a given position, and optional endianness
* Exraction of a float-64 (usually known in other languages as *double float*) from a given position, and optional endianness

#### Update data in a byte buffer ####

* Update an integer-8 value (a byte) from a given position, and optional signing specification
* Update an integer-16 value (usually known in other languages as *short int*) from a given position, and optional signing and endianness
* Update an integer-32 value (usually known in other languages as *int*) from a given position, and optional signing and endianness
* Update an integer-64 value (usually known in other languages as *long int*) from a given position, and optional signing and endianness
* Update a float-32 value (usually known in other languages as *float*) from a given position, and optional endianness
* Update a float-64 value (usually known in other languages as *double float*) from a given position, and optional endianness

#### Expressions for options ####

* Signing
    * Unsigned (default)
    * Signed
* [Endianness](https://en.wikipedia.org/wiki/Endianness)
    * Little-endian (default)
    * Big-endian

