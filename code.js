const SHEET_NAME = "커피주문";
const MENU_FOLDER_ID =
  "1bptCsJreA_saTjituhJ2OqgtHuP5fh6T";
function doGet(e) {

  const t =
    HtmlService.createTemplateFromFile("index");

  t.defaultTeam =
    e.parameter.team || "";

  return t.evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// 저장
function saveOrder(data) {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  const time = Utilities.formatDate(new Date(), "Asia/Seoul", "HH:mm:ss");

  // 🔥 여기서 변경
  data.names.forEach(name => {
    sheet.appendRow([
      data.team,
      time,
      name,
      data.menu,
      data.temp,
      data.size,
      data.option,
      data.note
    ]);
  });
}

// 🔥 전체 데이터 + 집계 한번에
function getAllData(team) {

  Logger.log(team);

  const result = {
    orders: getOrders(team),
    summary: getSummary(team)
  };

  Logger.log(JSON.stringify(result));

  return result;
}

// 전체 조회
function getOrders(team) {

  const data =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_NAME)
      .getDataRange()
      .getDisplayValues();

  return data
    .filter((r, i) =>
      i === 0 ||
      !team ||
      String(r[0]).trim() === String(team).trim()
    )
    .map((r, i) => [...r, i]);
}

// 삭제
function deleteRow(rowIndex) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.deleteRow(rowIndex + 1);
}

function deleteMultiple(indexes) {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_NAME);

  // 큰 번호부터 삭제
  indexes
    .sort((a, b) => b - a)
    .forEach(i => {

      // 헤더 제외 +1
      const rowNumber = i + 1;

      if (rowNumber > 1) {
        sheet.deleteRow(rowNumber);
      }
    });
}

// 주문 마감
function setOrderClosed(team, state) {

  const prop =
    PropertiesService.getScriptProperties();

  prop.setProperty(
    "ORDER_CLOSED_" + team,
    state ? "true" : "false"
  );
}

function getOrderClosed(team) {

  const prop =
    PropertiesService.getScriptProperties();

  return prop.getProperty(
    "ORDER_CLOSED_" + team
  ) === "true";
}

// 카톡 텍스트
function getOrderText(team) {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data =
    sheet.getDataRange()
      .getValues()
      .slice(1)
      .filter(r =>
        !team ||
        String(r[0]).trim() === String(team).trim()
      );

  const result = {};

  data.forEach(r => {
    const key = `${r[3]} ${r[2]} ${r[4]}`;
    const name = r[2];

    if (!result[key]) result[key] = [];
    result[key].push(name);
  });

  let text = "☕ 커피 주문\n────────────\n";

  Object.keys(result).sort().forEach(k => {
    text += `\n📌 ${k} (${result[k].length}잔)\n`;
    text += `${result[k].join(", ")}\n`;
  });

  text += "\n────────────";

  return text;
}

// 전체 삭제
function resetAllOrders() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

// code.js
function checkAdmin(password) {
  const ADMIN_PW = "3417";
  return password === ADMIN_PW;
}

// 집계
function getSummary(team) {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data =
    sheet.getDataRange()
      .getValues()
      .slice(1)
      .filter(r =>
        !team ||
        String(r[0]).trim() === String(team).trim()
      );

  const result = {};

  data.forEach(r => {

    const key = `${r[3]} ${r[2]} ${r[4]}`;
    const name = r[2];

    if (!result[key]) {
      result[key] = { count: 0, names: [] };
    }

    result[key].count++;
    result[key].names.push(name);
  });

  return result;
}

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