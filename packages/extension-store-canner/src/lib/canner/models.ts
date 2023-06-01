/**
 * The indicator file record the workspace sql name, every deployed and latest deployed version of artifact folder name
 */
export interface ArtifactIndicator {
  /**
   * {
   *  "master": "711c034c",
   *  "3f051d57": "1685207455869_3f051d57",
   *  "711c034c": "1685213384299_711c034c",
   *  "d9e3aa9f-fb6c-4a85-aaf2-bb766a66df83": "w05228",
   * }
   */
  // The latest deployed artifact folder sha name
  master: string;
  // The every deployed artifact folder name and workspace sql name
  [key: string]: string;
}
