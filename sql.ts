import initSqlJs, { Database, QueryExecResult } from 'sql.js';
import path from 'path';

type SQL = Awaited<ReturnType<typeof initSqlJs>>;

class SQLiteReader {
	private SQL ?: SQL;

	private initSQLJS = async () : Promise<SQL | undefined> => {
		try {
			if (!this.SQL)
				this.SQL = await initSqlJs({ locateFile: () => path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm') });
			return this.SQL;
		} catch (e) {
			console.error(e);
		}
		return undefined;
	};

	private execute = async ( cdb : Uint8Array<ArrayBuffer>, operation : (db : Database) => QueryExecResult) : Promise<QueryExecResult | undefined> => {
		const SQL = await this.initSQLJS();
		if (!SQL)
			return undefined;
		const db = new SQL.Database(new Uint8Array(cdb));
		let result : QueryExecResult | undefined = undefined;
		try {
			result = operation(db);
		} catch (e) {
			console.error(e);
		} finally {
			db.close();
		}
		return result;
	}

	async find(cdb : Uint8Array<ArrayBuffer>) : Promise<QueryExecResult | undefined> {
		let key = `
			SELECT
			datas.id,
			datas.ot,
			datas.alias,
			datas.setcode,
			datas.type,
			datas.atk,
			datas.def,
			datas.level,
			datas.race,
			datas.attribute,
			datas.category,
			texts.id,
			texts.name,
			texts.desc,
			texts.str1,
			texts.str2,
			texts.str3,
			texts.str4,
			texts.str5,
			texts.str6,
			texts.str7,
			texts.str8,
			texts.str9,
			texts.str10,
			texts.str11,
			texts.str12,
			texts.str13,
			texts.str14,
			texts.str15,
			texts.str16
			FROM datas, texts WHERE datas.id = texts.id
		`;

		return this.execute(cdb, (db) => {
			return db.exec(key)[0];
		});
	}
}

const SQL = new SQLiteReader()

export default SQL;