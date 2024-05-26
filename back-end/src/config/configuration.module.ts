import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync, existsSync } from 'fs';
import * as yaml from 'js-yaml';
import { isString, merge } from 'lodash';
import { join } from 'path';
import * as Bluebird from 'bluebird';

const logger = new Logger('XperienceConfigLoader');

const isSecretLocator = /^projects\/(?:\d{5,16}|.*)\/secrets\/.*$/;
const isSecretVersionLocator = /^projects\/(?:\d{5,16}|.*)\/secrets\/.*\/versions\/(?:\d{1,4}|latest)$/;

export interface XperienceConfigLoaderOptions {
    baseDirectory: string;
    configFilename: string;
    localConfigFilename?: string;
    secretManagerServiceClient?: SecretManagerServiceClient;
}

const rewriteRecordWithSecrets = async (records: any, level: string = '', secretManagerServiceClient?: SecretManagerServiceClient): Promise<any> => {
    for (const key in records) {
        if (isString(records[key])) {
            if (secretManagerServiceClient && isSecretLocator.test(records[key])) {
                try {
                    // Do we want a specific version or grab all active ones as an array?
                    if (isSecretVersionLocator.test(records[key])) {
                        const [accessResponse] = await secretManagerServiceClient.accessSecretVersion({
                            name: records[key],
                        });
                        records[key] = accessResponse.payload.data.toString();
                    } else {
                        const [versions] = await secretManagerServiceClient.listSecretVersions({ parent: records[key] });
                        const secrets: string[] = [];
                        await Bluebird.Promise.map(versions, async (version) => {
                            if (version.state === 'ENABLED' && isSecretVersionLocator.test(version.name)) {
                                const [accessResponse] = await secretManagerServiceClient.accessSecretVersion({
                                    name: version.name,
                                });
                                secrets.push(accessResponse.payload.data.toString());
                            }
                        }, { concurrency: 1 });
                        records[key] = secrets;
                    }
                    logger.debug(`Loaded secret from Google Secret Manager [${level}.${key}]`);
                } catch (e) {
                    console.log(JSON.stringify(e));
                    logger.warn(`Failed to load secret from Google Secret Manager [${level}.${key}]`);
                }
            }
        } else {
            await rewriteRecordWithSecrets(records[key], `${level}.${key}`, secretManagerServiceClient);
        }
    }
};

export const XperienceConfigLoader = async (options: XperienceConfigLoaderOptions) => {
    let cfg = yaml.load(
        readFileSync(join(options.baseDirectory, options.configFilename), 'utf8'),
    ) as Record<string, any>;

    if (!!options.localConfigFilename && existsSync(join(options.baseDirectory, options.localConfigFilename))) {
        // Looks like we have a local settings file with which we
        // want to override the prod values
        const local = yaml.load(
            readFileSync(join(options.baseDirectory, options.localConfigFilename), 'utf8'),
        ) as Record<string, any>;
        cfg = merge(cfg, local);
    }
    await rewriteRecordWithSecrets(cfg, undefined, options?.secretManagerServiceClient);
    return new ConfigService(cfg);
}