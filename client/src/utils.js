import * as XLSX from "xlsx";
export function excelToObject(file) {
  if (!file) return;
  return new Promise((resolve, reject) => {
    var reader = new FileReader();

    reader.onload = function (e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: "binary",
      });
      var XL_row_object = XLSX.utils.sheet_to_row_object_array(
        workbook.Sheets[workbook.SheetNames[0]]
      );
      var json_object = JSON.stringify(XL_row_object);
      resolve(JSON.parse(json_object));
    };

    reader.onerror = function (ex) {
      console.log(ex);
    };

    reader.readAsBinaryString(file);
  });
}

export function fileToRaw(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = function (e) {
      let buffer = e.target.result;
      resolve(
        [...new Uint8Array(buffer)]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")
      );
    };
    reader.onerror = function (ex) {
      console.log(ex);
    };
    reader.readAsArrayBuffer(file);
  });
}
