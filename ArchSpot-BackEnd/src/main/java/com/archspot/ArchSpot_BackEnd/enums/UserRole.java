package com.archspot.ArchSpot_BackEnd.enums;

public enum UserRole {
    ADMIN("Admin"),
	MEMBER("Member"),
    CUSTOMER("Customer");
	
	private String role;
	
	private UserRole(String role) {
		this.role = role;
	}
	
	public String getRole() {
		return role;
	}

}
