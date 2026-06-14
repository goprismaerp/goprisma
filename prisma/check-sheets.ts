import * as XLSX from 'xlsx';
const wb = XLSX.readFile('G:\\Meu Drive\\GoPrisma\\financeiro\\CUSTOS.xlsx');
console.log('Sheets:', JSON.stringify(wb.SheetNames));
const ws = wb.Sheets['Cadastro Filamentos'];
if (ws) {
  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
  console.log('Filamentos headers:', JSON.stringify(data[0]));
  console.log('Filamentos rows:', data.length);
  for (let r = 1; r < Math.min(data.length, 6); r++) {
    console.log('Row', r, ':', JSON.stringify(data[r]));
  }
}
