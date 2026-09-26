function saveTeamsToServer(teams) {
  const prop = PropertiesService.getScriptProperties();
  prop.setProperty("TEAMS", JSON.stringify(teams));
}

function getTeamsFromServer() {
  const prop = PropertiesService.getScriptProperties();
  return JSON.parse(prop.getProperty("TEAMS") || "{}");
}


// =========================
// 이름 저장
// =========================
function saveNamesToServer(team, names) {

  const prop = PropertiesService.getScriptProperties();

  prop.setProperty(
    "NAME_LIST_" + team,
    JSON.stringify(names)
  );

  return names;
}

function getNamesFromServer(team) {

  const prop = PropertiesService.getScriptProperties();

  return JSON.parse(
    prop.getProperty(
      "NAME_LIST_" + team
    ) || "[]"
  );
} function saveMenuImage(
  team,
  imageData,
  fileName
) {

  Logger.log("파일명: " + fileName);
  Logger.log("데이터길이: " + imageData.length);

  const folder =
    DriveApp.getFolderById(
      MENU_FOLDER_ID
    );

  Logger.log("1");

  const bytes =
    Utilities.base64Decode(
      imageData.split(",")[1]
    );

  Logger.log("2");

  const mime =
    imageData.match(
      /^data:(.*?);base64/
    )[1];

  Logger.log("3");

  const blob =
    Utilities.newBlob(
      bytes,
      mime,
      fileName || "image.jpg"
    );

  Logger.log("4");

  const file =
    folder.createFile(blob);

  Logger.log("5");

  const props =
    PropertiesService.getScriptProperties();

  const key =
    "MENU_IMAGE_" + team;

  const list = JSON.parse(
    props.getProperty(key) || "[]"
  );

  list.push({
    id: file.getId(),
    name: fileName
  });

  props.setProperty(
    key,
    JSON.stringify(list)
  );

  Logger.log("6");

  return true;
}
function getMenuImages(team) {

  const props =
    PropertiesService.getScriptProperties();

  const list = JSON.parse(
    props.getProperty(
      "MENU_IMAGE_" + team
    ) || "[]"
  );

  return list.map(item => ({

    id: item.id,

    name: item.name,

    url:
      "https://drive.google.com/thumbnail?id="
      + item.id +
      "&sz=w1000"

  }));
}

function deleteMenuImage(
  team,
  fileId
) {

  try {

    DriveApp
      .getFileById(fileId)
      .setTrashed(true);

  } catch (err) { }

  const props =
    PropertiesService.getScriptProperties();

  const key =
    "MENU_IMAGE_" + team;

  const list = JSON.parse(
    props.getProperty(key) || "[]"
  );

  const newList =
    list.filter(
      x => x.id !== fileId
    );

  props.setProperty(
    key,
    JSON.stringify(newList)
  );

  return true;
}

function debugTeams() {
  const prop =
    PropertiesService.getScriptProperties();

  Logger.log(
    prop.getProperty("TEAMS")
  );
}
function setCurrentTeam(team) {
  PropertiesService
    .getScriptProperties()
    .setProperty("CURRENT_TEAM", team);
}

function getCurrentTeam() {
  return PropertiesService
    .getScriptProperties()
    .getProperty("CURRENT_TEAM") || "";
}

function saveHiddenNames(team, names) {

  PropertiesService
    .getScriptProperties()
    .setProperty(
      "HIDDEN_NAMES_" + team,
      JSON.stringify(names)
    );
}

function getHiddenNames(team) {

  return JSON.parse(
    PropertiesService
      .getScriptProperties()
      .getProperty(
        "HIDDEN_NAMES_" + team
      ) || "[]"
  );
}

function setLinkTeam(defaultTeam, selectedTeam) {

  PropertiesService
    .getScriptProperties()
    .setProperty(
      "LINK_TEAM_" + defaultTeam,
      selectedTeam
    );
}

function getLinkTeam(defaultTeam) {

  return PropertiesService
    .getScriptProperties()
    .getProperty(
      "LINK_TEAM_" + defaultTeam
    ) || defaultTeam;
}