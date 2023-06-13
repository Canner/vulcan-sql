export interface IEnvConfig {
  // indicates whether the extension is running in k8s
  isOnKubernetes?: boolean;
}

const config: IEnvConfig = {
  isOnKubernetes: Boolean(process.env['IS_ON_KUBERNETES']) || false,
};

export default config;
