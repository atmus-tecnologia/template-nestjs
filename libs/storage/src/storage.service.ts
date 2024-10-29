import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { randomUUID } from 'crypto';
import fs from 'fs';
import mime from 'mime-types';
import path from 'path';

interface FileData {
  buffer: Buffer;
  mimetype: string;
  filename: string;
  originalname: string;
}

@Injectable()
export class StorageService {
  private s3 = new S3();

  readFile(pathFile: string) {
    if (process.env.STORAGE_TYPE === 's3') {
      return this.s3
        .getObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: pathFile,
        })
        .promise();
    } else {
      const mimetype = mime.lookup(pathFile) || 'application/octet-stream';
      const buffer = fs.readFileSync(path.join('storage', pathFile));
      return { ContentType: mimetype, Body: buffer };
    }
  }

  async uploadFile(file: FileData, pathFile?: string) {
    const extension = file.originalname.split('.').pop();
    const fileName = `${file?.filename || randomUUID()}.${extension}`;
    const saveFile = pathFile ? `${pathFile}/${fileName}` : fileName;

    if (process.env.STORAGE_TYPE === 's3') {
      const result = await this.s3
        .upload({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: saveFile,
          Body: file.buffer,
          // ACL: 'public-read',
          ContentType: file.mimetype,
        })
        .promise();

      return { Key: result.Key };
    } else {
      // Criar o path para salvar o arquivo
      const pathToSave = path.join('storage', saveFile);

      // Veriricar se o pathFile existe, caso não exista, criar recursivamente
      fs.mkdirSync(path.dirname(pathToSave), { recursive: true });

      // Salvar o arquivo
      fs.writeFileSync(pathToSave, file.buffer);

      return { Key: saveFile };
    }
  }

  async uploadFiles(files: FileData[], pathFiles?: string) {
    const promises = files.map(file => this.uploadFile(file, pathFiles));
    return Promise.all(promises);
  }

  async deleteFile(pathFile: string) {
    if (process.env.STORAGE_TYPE === 's3') {
      await this.s3
        .deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: pathFile,
        })
        .promise();
    } else {
      try {
        fs.unlinkSync(path.join('storage', pathFile));
      } catch (error) {
        console.error(error);
      }
    }
  }

  async deleteFiles(pathFiles: string[]) {
    const promises = pathFiles.map(pathFile => this.deleteFile(pathFile));
    await Promise.all(promises);
  }

  async listFiles(path?: string) {
    if (process.env.STORAGE_TYPE === 's3') {
      return this.s3
        .listObjects({
          Bucket: process.env.AWS_S3_BUCKET,
          Prefix: path,
        })
        .promise();
    } else {
      return { Contents: [] };
    }
  }
}
