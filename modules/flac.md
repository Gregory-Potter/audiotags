<style>
	h1, h2, h3 { color: khaki; }
	ul {
		color: #fff;
		padding-left: 1em;
	}
	ul ul { color: #bbb; }
	ul ul ul { color: #777; }
</style>

*This is just my condensed notes from going through the official spec as found [here](https://www.rfc-editor.org/rfc/rfc9639.html).*

# FLAC File Structure

"Blocks" are sections of metadata. "Frames" are sections of audio data.

## Overview
- FLAC Signature
	- 4 bytes: the ascii string "fLaC"
- Metadata Blocks
	
	For each block
	
	- 4 bytes: Block Header
		- 1 bit: indicates if the block is the final metadata block (1) or if others follow (0)
		- 7 bits: the block type number value
		- 3 bytes: the block's length in bytes (`blockLength`)
	- `blockLength` bytes: see Block Types section
- Audio Frames

## Block Types
- STREAMINFO (blockType = 0)
	- 2 bytes: minimum block size
	- 2 bytes: maximum block size
	- 3 bytes: minimum frame size
	- 3 bytes: maximum frame size
	- 8 bytes: uneven bits
		- 20 bits: sample rate in Hz
		- 3 bits: number of channels minus one
		- 5 bits: sample bit depth (4–32 supported)
		- 36 bits: total number of samples
	- 16 bytes: MD5 signature of the unencoded audio data, useful for integrity checks
- PADDING (blockType = 1)
- APPLICATION (blockType = 2)
- SEEKTABLE (blockType = 3)
- VORBIS_COMMENT (blockType = 4)
	- 4 bytes: length in bytes of the vendor string coded unsigned **little-endian** (`vendorLength`)
	- `vendorLength` bytes: UTF-8 encoded vendor string
	- 4 bytes: number of comments coded unsigned **little-endian**
	
	For each comment
	
	- 4 bytes: the comment length in bytes coded unsigned **little-endian** (`commentLength`)
	- `commentLength` bytes: UTF-8 string with form "KEY=value", where keys cannot contain an equal sign, **but values can**.
- CUESHEET (blockType = 5)
- PICTURE (blockType = 6)
	- This block is used to embed cover art and other associated images within the FLAC file.
- 7–126 Reserved
- 127 Forbidden
