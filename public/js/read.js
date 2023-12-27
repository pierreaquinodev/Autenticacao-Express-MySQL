window.onload = () => {
    getUsuarios();
};

function getUsuarios() {
    fetch("http://localhost:3001/usuarios/read")
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                console.log("erro ao obter usuarios");
            }
        })
        .then((dados) => {
            if (dados.length === 0) {
                console.log("erro");
            } else {
                dados.forEach((dado) => {
                    let new_user = document.createElement("tr");
                    let html = `
                                    <td>${dado.id}</td>
                                    <td>${dado.nome}</td>
                                    <td>${dado.login}</td>
                                    <td>${dado.senha}</td>
                               `;

                    new_user.innerHTML = html;

                    document.querySelector(".read-usuarios").appendChild(new_user);
                });
            }
        });
}
