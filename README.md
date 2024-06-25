# package-data-js

Data package for the [Fōrmulæ](https://formulae.org) programming language.

Fōrmulæ is also a software framework for visualization, edition and manipulation of complex expressions, from many fields. The code for an specific field —i.e. arithmetics— is encapsulated in a single unit called a Fōrmulæ **package**.

This repository contains the source code for the **data package**. It is intended for the conversion between byte buffers and arbitrary strings, Base64 strings, hexadecimal strings, etc.

The GitHub organization [formulae-org](https://github.com/formulae-org) encompasses the source code for the rest of packages, as well as the [web application](https://github.com/formulae-org/formulae-js).

<!--
Take a look at this [tutorial](https://formulae.org/?script=tutorials/Complex) to know the capabilities of the Fōrmulæ arithmetic package.
-->

### Capabilities ###

#### The **Byte buffer** expression

The byte buffer expression is a collecion of raw bytes.

#### Creation ####

* Creation of a byte buffer of a given size (number of bytes) with zero values.

#### Conversions ####

* Conversion from/to a byte buffer to/from an arbitrary string (Unicode is supported).
* Conversion from/to a byte buffer to/from a Base64 string.
* Conversion from/to a byte buffer to/from a hexadecimal string.
* Conversion from/to a byte buffer to/from an array of integers.

#### Extraccion of data from a byte array ####

* Exraction of an integer-8 (a byte) from a given position, and optional sign specification (unsigned default, signed)
* Exraction of an integer-16 (ususally known in other languages as *short int*) from a given position, and optional sign specification (unsigned default, signed), and optional endianness (little endian defualt, big endian)
* Exraction of an integer-32 (ususally known in other languages as *int*) from a given position, and optional sign specification (unsigned default, signed), and optional endianness (little endian defualt, big endian)
* Exraction of an integer-64 (ususally known in other languages as *long int*) from a given position, and optional sign specification (unsigned default, signed), and optional endianness (little endian defualt, big endian)
* Exraction of a float-32 (ususally known in other languages as *float*) from a given position, and optional endianness (little endian defualt, big endian)
* Exraction of a float-64 (ususally known in other languages as *double float*) from a given position, and optional endianness (little endian defualt, big endian)

#### Update data of a byte array ####

* Update a an integer-8 value (a byte) from a given position, and optional sign specification (unsigned default, signed)
* Update a an integer-16 value (ususally known in other languages as *short int*) from a given position, and optional sign specification (unsigned default, signed), and optional endianness (little endian defualt, big endian)
* Update a an integer-32 value (ususally known in other languages as *int*) from a given position, and optional sign specification (unsigned default, signed), and optional endianness (little endian defualt, big endian)
* Update a an integer-64 value (ususally known in other languages as *long int*) from a given position, and optional sign specification (unsigned default, signed), and optional endianness (little endian defualt, big endian)
* Update a a float-32 value (ususally known in other languages as *float*) from a given position, and optional endianness (little endian defualt, big endian)
* Update a a float-64 value (ususally known in other languages as *double float*) from a given position, and optional endianness (little endian defualt, big endian)


