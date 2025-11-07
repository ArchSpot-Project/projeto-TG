package com.archspot.ArchSpot_BackEnd.enums;

public enum ProjectStatus {
    PLANNED("Planned"),          // planejado, ainda não iniciado
    IN_PROGRESS("In progress"),  // em andamento
    COMPLETED("Completed"),      // concluído
    CANCELLED("Cancelled");      // cancelado

    private final String label;

    ProjectStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
