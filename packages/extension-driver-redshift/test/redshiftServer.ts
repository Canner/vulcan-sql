export class RedShiftFakeServer {
  constructor() {
    [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_REDSHIFT_DATABASE',
      'AWS_REDSHIFT_WORKGROUP_NAME',
    ].forEach((envName) => {
      if (!process.env[envName]) throw new Error(`${envName} not defined`);
    });
  }

  public getProfile(name: string) {
    return {
      name,
      type: 'redshift',
      connection: {
        credentials: {
          accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
          secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
        },
        Database: process.env['AWS_REDSHIFT_DATABASE'],
        WorkgroupName: process.env['AWS_REDSHIFT_WORKGROUP_NAME'],
      },
      allow: '*',
    };
  }
}
