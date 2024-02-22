export interface IManifest<M> {
  toManifest(renderOptions: any): M | M[];
}
