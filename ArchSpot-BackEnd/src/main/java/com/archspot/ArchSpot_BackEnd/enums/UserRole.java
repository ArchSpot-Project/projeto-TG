package com.archspot.ArchSpot_BackEnd.enums;

public enum UserRole {
    ADMIN("Admin"), // Criador e administrador de um Projeto
		STAFF("Staff"), // Colaborador interno
    CUSTOMER("Customer"), // Cliente final que contratou o serviço
		EXTERNAL_COLLABORATOR("External Collaborator"); // Colaborador externo
	
	private String role;
	
	private UserRole(String role) {
		this.role = role;
	}
	
	public String getRole() {
		return role;
	}

}
