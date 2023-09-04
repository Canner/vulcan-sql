[
  'REDSHIFT_ACCESS_KEY_ID',
  'REDSHIFT_SECRET_ACCESS_KEY',
  'REDSHIFT_DATABASE',
  'REDSHIFT_WORKGROUP_NAME',
].forEach((envName) => {
  if (!process.env[envName]) throw new Error(`${envName} not defined`);
});

export class RedShiftFakeServer {
  public getProfile(name: string) {
    return {
      name,
      type: 'redshift',
      connection: {
        credentials: {
          accessKeyId: process.env['REDSHIFT_ACCESS_KEY_ID'],
          secretAccessKey: process.env['REDSHIFT_SECRET_ACCESS_KEY'],
        },
        Database: process.env['REDSHIFT_DATABASE'],
        WorkgroupName: process.env['REDSHIFT_WORKGROUP_NAME'],
      },
      allow: '*',
    };
  }
}
