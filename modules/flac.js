const BLOCKTYPE = Object.freeze({
	STREAMINFO: 0,
	PADDING: 1,
	APPLICATION: 2,
	SEEKTABLE: 3,
	VORBIS_COMMENT: 4,
	CUESHEET: 5,
	PICTURE: 6
});

export const getFlacMetadata = async (file) => {
	const buff = await file.arrayBuffer();
	const data = new DataView(buff);
	
	// Verify "fLaC" signature
	const signature = String.fromCharCode(
		data.getUint8(0),
		data.getUint8(1),
		data.getUint8(2),
		data.getUint8(3)
	);
	if (signature !== 'fLaC') {
		throw new Error('Invalid "fLaC" signature.');
	}
	
	let offset = 4; // start after signature
	const info = {
		sampleRate: 0,
		bitDepth: 0,
		tags: {
			'ARTIST': '',
			'ALBUM': '',
			'TITLE': '',
			'TRACKNUMBER': '',
			'TRACKTOTAL': '',
			'DATE': '',
			'GENRE': '',
			'LYRICS': ''
		}
	};
	
	while (offset < data.byteLength) {
		const headerByte = data.getUint8(offset);
		const isLast = (headerByte & 0x80) !== 0;
		const blockType = headerByte & 0x7F;
		const blockLength = data.getUint32(offset) & 0x00FFFFFF; // last 3 bytes
		
		offset += 4; // move past block header
		
		if (blockType === BLOCKTYPE.STREAMINFO) {
			const uint = data.getUint32(offset + 10, false);
			info.sampleRate = (uint >>> 12) & 0xFFFFF;
			const numOfChannels = ((uint >>> 9) & 0x7) + 1;
			info.bitDepth = ((uint >>> 4) & 0x1F) + 1;
			
			offset += blockLength;
		}
		else if (blockType === BLOCKTYPE.VORBIS_COMMENT) {
			const vendorLen = data.getUint32(offset, true);
			offset += 4 + vendorLen; // move past vendor string
			
			const commentCount = data.getUint32(offset, true);
			offset += 4; // move past comment count
			
			const textDecoder = new TextDecoder();
			// loop through each comment
			for (let i = 0; i < commentCount; i++) {
				const len = data.getUint32(offset, true);
				offset += 4; // move past comment length
				
				const bytes = new Uint8Array(buff, offset, len);
				const comment = textDecoder.decode(bytes);
				offset += len; // move offset to next comment
				
				const separatorIndex = comment.indexOf("=");
				if (separatorIndex	< 1) continue;
				const key = comment.slice(0, separatorIndex).toUpperCase();
				const value = comment.slice(separatorIndex + 1);
				info.tags[key] = value;
			}
		}
		else {
			offset += blockLength;
		}
		if (isLast) return info;
	}
};