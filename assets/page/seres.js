function fetchSeres() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:8080/api/seres', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const seres = JSON.parse(xhr.responseText);
        populateTable(seres);
      } else {
        alert('Erro ao carregar os seres');
      }
    }
  };
  xhr.send();
}

function populateTable(seres) {
  const tbody = document.querySelector('#seres-table tbody');
  tbody.innerHTML = ''; // Limpa a tabela antes de preencher

  seres.forEach(ser => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${ser.id}</td>
      <td>${ser.nome_cientifico}</td>
      <td>${ser.nome_comum}</td>
      <td>${ser.latitude}</td>
      <td>${ser.longitude}</td>
      <td>${ser.categoria_id}</td>
      <td>${ser.tipo_id}</td>
      <td>${ser.data_aprovacao}</td>
      <td>${ser.data_registro}</td>
      <td>${ser.status_aprovacao}</td>
      <td>${ser.status_conservacao}</td>
      <td>${ser.descricao}</td>
      <td>${ser.imagem ? `<img src="${ser.imagem}" alt="${ser.nome_comum}">` : ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Executa ao carregar a página
window.onload = fetchSeres;
