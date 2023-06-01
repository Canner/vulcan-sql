import { ObjectBasicInfo } from '@canner/canner-storage';
import { chain } from 'lodash';

// The pattern for listing vulcansql folder path
export const vulcanFolderPathPattern = new RegExp('([a-zA-Z0-9-]+)/vulcansql');
// The pattern for finding indicator.json file from vulcansql folder
export const indicatorPathPattern = new RegExp(
  `${vulcanFolderPathPattern.source.replace('\\', '')}/indicator.json`
);

/**
 * Get the indicator files path of each workspaces
 * @param filesInfo files info from storage service
 * @returns the indicator files path of each workspaces
 */
export const geIndicatorFilesOfWorkspaces = async (
  filesInfo: ObjectBasicInfo[]
) => {
  const filePaths = chain(filesInfo)
    .filter((fileInfo) => indicatorPathPattern.test(fileInfo.name))
    .map((fileInfo) => {
      return {
        name: fileInfo.name,
        workspaceId: vulcanFolderPathPattern.exec(fileInfo.name)![1],
      };
    })
    .value();
  return filePaths;
};
