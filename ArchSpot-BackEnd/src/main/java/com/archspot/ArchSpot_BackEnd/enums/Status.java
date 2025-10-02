package com.archspot.ArchSpot_BackEnd.enums;

public enum Status {
    PLANNED("Planned"),          // planejado, ainda não iniciado
    IN_PROGRESS("In progress"),  // em andamento
    COMPLETED("Completed"),      // concluído
    CANCELLED("Cancelled");      // cancelado

    private final String label;

    Status(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
