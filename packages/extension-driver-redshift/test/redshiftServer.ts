[
  'REDSHIFT_ACCESS_KEY_ID',
  'REDSHIFT_SECRET_ACCESS_KEY',
  'REDSHIFT_REGION',
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
        region: process.env['REDSHIFT_REGION'],
        database: process.env['REDSHIFT_DATABASE'],
        workgroupName: process.env['REDSHIFT_WORKGROUP_NAME'],
      },
      allow: '*',
    };
  }
}

// REDSHIFT_ACCESS_KEY_ID=AKIA3FI4OMDSFSBRQL67 REDSHIFT_SECRET_ACCESS_KEY=DmPsIvynQuOD8sticdxIVJehyVAPZz1ZR56qrTCd REDSHIFT_REGION=ap-northeast-1 REDSHIFT_DATABASE=sample_data_dev REDSHIFT_WORKGROUP_NAME=default-workgroup  yarn nx test extension-driver-redshift