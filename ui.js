import { records, addRecord, updateRecord, deleteRecord } from './state.js';
import { validate } from './validators.js';
import { compileRegex, highlight } from './search.js';

const tableBody = document.querySelector('#recordsTable tbody');
const form = document.querySelector('#recordForm');
const status = document.querySelector('#formStatus');
const searchInput = document.querySelector('#searchInput');

let editId = null;

export function render(recordsToShow=records, re=null){
  tableBody.innerHTML = recordsToShow.length ? 
    recordsToShow.map(r => `
      <tr>
        <td>${highlight(r.description, re)}</td>
        <td>${r.amount}</td>
        <td>${highlight(r.category, re)}</td>
        <td>${r.date}</td>
        <td>${r.type}</td>
        <td>
          <button data-id="${r.id}" class="edit">✏️</button>
          <button data-id="${r.id}" class="delete">🗑️</button>
        </td>
      </tr>
    `).join('') :
    '<tr><td colspan="6">No records found.</td></tr>';
}

export function initUI(){
  render();

  // Form submit
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const data = {
      description: form.description.value.trim(),
      category: form.category.value.trim(),
      amount: form.amount.value,
      date: form.date.value,
      type: form.type.value,
      updatedAt: new Date().toISOString()
    };

    for(let field of ['description','category','amount','date']){
      if(!validate(field,data[field])){
        status.textContent = `Invalid ${field}`;
        return;
      }
    }

    if(editId){
      updateRecord(editId,data);
      status.textContent='Record updated!';
      editId=null;
    } else {
      addRecord({
        ...data,
        id: 'txn_'+Date.now(),
        createdAt: new Date().toISOString()
      });
      status.textContent='Record added!';
    }
    render();
    form.reset();
  });

  // Table actions
  tableBody.addEventListener('click', e=>{
    const id = e.target.dataset.id;
    if(e.target.classList.contains('delete')){
      if(confirm('Delete this record?')){
        deleteRecord(id);
        render();
      }
    }
    if(e.target.classList.contains('edit')){
      const rec = records.find(r=>r.id===id);
      form.description.value=rec.description;
      form.amount.value=rec.amount;
      form.category.value=rec.category;
      form.date.value=rec.date;
      form.type.value=rec.type;
      editId=id;
      status.textContent='Editing record...';
      form.description.focus();
    }
  });

  // Regex search
  searchInput.addEventListener('input', e=>{
    const re = compileRegex(e.target.value);
    render(records,re);
  });

  // Export JSON
  document.querySelector('#exportBtn').addEventListener('click',()=>{
    const dataStr = JSON.stringify(records,null,2);
    const blob = new Blob([dataStr], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download='finance_data.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import JSON
  document.querySelector('#importFile').addEventListener('change', e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = evt=>{
      try{
        const imported = JSON.parse(evt.target.result);
        if(!Array.isArray(imported)) throw new Error('Invalid JSON');
        for(let rec of imported){
          if(!rec.id || !rec.description || !rec.amount || !rec.date || !rec.category) throw new Error('Missing fields');
        }
        records.length=0;
        imported.forEach(r=>records.push(r));
        render();
        status.textContent='Data imported successfully!';
      } catch(err){
        alert('Import failed: '+err.message);
      }
    };
    reader.readAsText(file);
  });
}
