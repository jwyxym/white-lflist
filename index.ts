import sql from './sql'

import fs from 'fs';
import { QueryExecResult } from 'sql.js';

async function main () {
	const cards = await read_sql();
	const dt = read_dt();
	write(cards, dt);
}

const read_dt = () : string => {
	return fs.readFileSync(argvs[2], 'utf8');
}

const read_sql = async () : Promise<Array<Array<string | number>>> => {
	const buffer = fs.readFileSync(argvs[0]);
	const cdb : QueryExecResult | undefined = await sql.find(new Uint8Array(buffer.buffer.slice(
		buffer.byteOffset, 
		buffer.byteOffset + buffer.byteLength
	)));
	const result = cdb?.values as Array<Array<string | number>> | undefined;
	return result ?? [];
}

const write = (cards : Array<Array<string | number>>, dt : string) : void => {
	fs.writeFileSync(argvs[1], '', { encoding: 'utf8' });
	const lflist = fs.createWriteStream(argvs[1], {
		flags: 'a',
		encoding: 'utf8',
		autoClose: false
	});
	lflist.write(`!${argvs[3]}\r\n`);
	const dts = dt.split(/\r?\n/).map(i => {
		const ct = i.indexOf(' ');
		if (ct !== -1) {
			const code = i.substring(0, ct);
			const padding = '0'.repeat(Math.max(0, 8 - code.length));
			return [padding + code, i.substring(ct)];
		}
		return [];
	}).filter(i => i.length > 0);
	cards.forEach(i => {
		const code = '0'.repeat(Math.max(0, 8 - i[0].toString().length)) + i[0].toString();
		if (!dts.map(i => i[0]).includes(code))
		lflist.write(`${code} 0 --${i[12]}\r\n`);
	});
	dts.forEach(i => {
		lflist.write(`${i[0]}${i[1]}\r\n`);
	});
	lflist.end();
}

const argvs = process.argv.slice(2);
main();