import fs from 'fs';
import AdmZip from 'adm-zip';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import iconv from 'iconv-lite';
import { logger } from '@jobscale/logger';
import { describe, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../app/index.js';

const filename = 'db/database.sqlite';

describe('initialize and test', () => {
  describe('setup database phase', () => {
    let db;
    beforeAll(async () => {
      await fs.promises.mkdir('db', { recursive: true });
      const isExists = fs.existsSync(filename);
      db = await open({
        filename,
        driver: sqlite3.Database,
      });

      // 既存DBがあるか確認
      if (isExists) {
        logger.info('skipped create database');
        return;
      }

      // DB作成
      // create.sql を流し込む
      const createSql = fs.readFileSync('create.sql', 'utf8');
      await db.exec(createSql);

      // ken_all.zip があるか確認
      let buffer;
      const zipPath = 'ken_all.zip';
      if (fs.existsSync(zipPath)) {
        logger.info('ローカルの ken_all.zip を使用します');
        buffer = fs.readFileSync(zipPath);
      } else {
        logger.info('日本郵便から fetch で ken_all.zip を取得します');
        const res = await fetch('https://www.post.japanpost.jp/zipcode/dl/kogaki/zip/ken_all.zip');
        buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(zipPath, buffer); // ダウンロードしたZIPを保存
      }

      // unzip
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();
      const csvEntry = entries.find(e => e.entryName.toUpperCase().includes('KEN_ALL.CSV'));
      // Shift-JIS → UTF-8
      const utf8Text = iconv.decode(csvEntry.getData(), 'Shift_JIS');

      // CSVを行ごとに処理してDBへ挿入
      const lines = utf8Text.split('\n').filter(l => l.trim().length > 0);

      // INSERT文準備（15列）
      const placeholders = Array(15).fill('?').join(',');
      const stmt = await db.prepare(`INSERT INTO ken VALUES (${placeholders})`);

      await db.exec('BEGIN TRANSACTION');
      for (const line of lines) {
        const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').replace(/\uFF5E/g, '\u301C'));
        if (cols.length === 15) {
          await stmt.run(cols);
        }
      }
      await stmt.finalize();
      await db.exec('COMMIT');
    });

    afterAll(async () => {
      await db.close();
      logger.info('finished');
    });

    it('true step', async () => {
      // クエリ実行
      const rows = await db.all(
        "SELECT * FROM ken WHERE postal_code7 LIKE '534002%' LIMIT 2 OFFSET 2",
      );

      logger.info(JSON.stringify({ rows }));
      expect(rows).toHaveLength(2);
      expect(rows[0].address).toBe('中野町');
      expect(rows[1].address).toBe('東野田町');
    });
  });

  describe('test phase', () => {
    let db;
    beforeEach(async () => {
      db = await open({
        filename,
        driver: sqlite3.Database,
      });
    });

    afterEach(async () => {
      await db.close();
    });

    describe('mock up test', () => {
      it('service.hostname', async () => {
        const originalFetch = global.fetch;
        global.fetch = jest.fn(() =>
          Promise.resolve({
            text: () => Promise.resolve('127.0.0.1'),
          }),
        );

        try {
          const { body } = await request(app).post('/api/hostname');
          expect(body).toHaveProperty('hostname');
          expect(body).toHaveProperty('ip');
          expect(body.ip).toBe('127.0.0.1');
        } finally {
          global.fetch = originalFetch;
        }
      });
    });

    describe('true test', () => {
      it('service.find Tokyo', async () => {
        const { body: rows } = await request(app)
        .post('/api/find')
        .send({ code: '1000001' });
        logger.info(JSON.stringify({ length: rows.length, rows }));
        expect(rows).toHaveLength(1);
        expect(rows[0].code).toBe('1000001');
        expect(rows[0].pref).toBe('東京都');
        expect(rows[0].city).toBe('千代田区');
        expect(rows[0].address).toBe('千代田');
      });

      it('service.find Hokkaido', async () => {
        const { body: rows } = await request(app)
        .post('/api/find')
        .send({ code: '00100' });
        logger.info(JSON.stringify({ length: rows.length, rows }));
        expect(rows).toHaveLength(32);
        expect(rows[0].pref).toBe('北海道');
        expect(rows[0].city).toBe('札幌市北区');
        expect(rows[0].address).toBe('北十条西（１〜４丁目）');
      });

      it('service.find Okinawa', async () => {
        const { body: rows } = await request(app)
        .post('/api/find')
        .send({ code: '90000' });
        logger.info(JSON.stringify({ length: rows.length, rows }));
        expect(rows).toHaveLength(28);
        expect(rows[0].code).toBe('9000001');
        expect(rows[0].pref).toBe('沖縄県');
        expect(rows[0].city).toBe('那覇市');
        expect(rows[0].address).toBe('港町');
      });

      it('service.find Mie', async () => {
        const { body: rows } = await request(app)
        .post('/api/find')
        .send({ code: '510000' });
        logger.info(JSON.stringify({ length: rows.length, rows }));
        expect(rows).toHaveLength(8);
        expect(rows[0].code).toBe('5100001');
        expect(rows[0].pref).toBe('三重県');
        expect(rows[0].city).toBe('四日市市');
        expect(rows[0].address).toBe('八田');
      });

      it('service.find Osaka', async () => {
        const { body: rows } = await request(app)
        .post('/api/find')
        .send({ code: '532000' });
        logger.info(JSON.stringify({ length: rows.length, rows }));
        expect(rows).toHaveLength(6);
        expect(rows[0].code).toBe('5320001');
        expect(rows[0].pref).toBe('大阪府');
        expect(rows[0].city).toBe('大阪市淀川区');
        expect(rows[0].address).toBe('十八条');
      });

      it('service.find Kyoto', async () => {
        const { body: rows } = await request(app)
        .post('/api/find')
        .send({ code: '611000' });
        logger.info(JSON.stringify({ length: rows.length, rows }));
        expect(rows).toHaveLength(3);
        expect(rows[0].code).toBe('6110001');
        expect(rows[0].pref).toBe('京都府');
        expect(rows[0].city).toBe('宇治市');
        expect(rows[0].address).toBe('六地蔵');
      });
    });

    describe('can not find all test', () => {
      it('service.find with short code', async () => {
        const { body: result } = await request(app)
        .post('/api/find')
        .send({ code: '12' });
        expect(result).toEqual([]);
      });

      it('service.find with non-existent code', async () => {
        const { body: result } = await request(app)
        .post('/api/find')
        .send({ code: '9999999' });
        expect(result).toEqual([]);
      });
    });
  });
});
