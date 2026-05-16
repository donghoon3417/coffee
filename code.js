const SHEET_NAME = "커피주문";

function doGet() {
  return HtmlService.createTemplateFromFile("index").evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// 저장
function saveOrder(data) {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  const time = Utilities.formatDate(new Date(), "Asia/Seoul", "HH:mm:ss");

  // 🔥 여기서 변경
  data.names.forEach(name=>{
    sheet.appendRow([
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
function getAllData(){

  return {
    orders: getOrders(),
    summary: getSummary()
  };
}

// 전체 조회
function getOrders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  return sheet.getDataRange().getDisplayValues().map((r,i)=>[...r,i]);
}

// 삭제
function deleteRow(rowIndex){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.deleteRow(rowIndex + 1);
}

function deleteMultiple(indexes){

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  indexes.sort((a,b)=> b - a);

  indexes.forEach(i=>{
    sheet.deleteRow(i + 1);
  });
}

// 주문 마감
function setOrderClosed(state){
  const prop = PropertiesService.getScriptProperties();
  prop.setProperty("ORDER_CLOSED", state ? "true" : "false");
}

function getOrderClosed(){
  const prop = PropertiesService.getScriptProperties();
  return prop.getProperty("ORDER_CLOSED") === "true";
}

// 카톡 텍스트
function getOrderText(){

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues().slice(1);

  const result = {};

  data.forEach(r=>{
    const key = `${r[3]} ${r[2]} ${r[4]}`;
    const name = r[1];

    if(!result[key]) result[key] = [];
    result[key].push(name);
  });

  let text = "☕ 커피 주문\n────────────\n";

  Object.keys(result).sort().forEach(k=>{
    text += `\n📌 ${k} (${result[k].length}잔)\n`;
    text += `${result[k].join(", ")}\n`;
  });

  text += "\n────────────";

  return text;
}

// 전체 삭제
function resetAllOrders(){

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if(lastRow > 1){
    sheet.deleteRows(2, lastRow - 1);
  }
}

// 집계
function getSummary(){

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues().slice(1);

  const result = {};

  data.forEach(r=>{

    const key = `${r[3]} ${r[2]} ${r[4]}`;
    const name = r[1];

    if(!result[key]){
      result[key] = { count: 0, names: [] };
    }

    result[key].count++;
    result[key].names.push(name);
  });

  return result;
}

function saveTeamsToServer(teams){
  const prop = PropertiesService.getScriptProperties();
  prop.setProperty("TEAMS", JSON.stringify(teams));
}

function getTeamsFromServer(){
  const prop = PropertiesService.getScriptProperties();
  return JSON.parse(prop.getProperty("TEAMS") || "{}");
}


