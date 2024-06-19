# package-data-js

Data package for the [Fōrmulæ](https://formulae.org) programming language.

Fōrmulæ is also a software framework for visualization, edition and manipulation of complex expressions, from many fields. The code for an specific field —i.e. arithmetics— is encapsulated in a single unit called a Fōrmulæ **package**.

This repository contains the source code for the **data package**. It is intended for the conversion between byte buffers and arbitrary strings, Base64 strings, hexadecimal strings, etc.

The GitHub organization [formulae-org](https://github.com/formulae-org) encompasses the source code for the rest of packages, as well as the [web application](https://github.com/formulae-org/formulae-js).

<!--
Take a look at this [tutorial](https://formulae.org/?script=tutorials/Complex) to know the capabilities of the Fōrmulæ arithmetic package.
-->

### Capabilities ###

The main expression is the **byte buffer**, a collecion of raw bytes.

* Conversion between a byte buffer and arbitrary strings (Unicode is supported).
* Conversion between a byte buffer and Base64 strings.
* Conversion between a byte buffer and hexadecimal strings.
