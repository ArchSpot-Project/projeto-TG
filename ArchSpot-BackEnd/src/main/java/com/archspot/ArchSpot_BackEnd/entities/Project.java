package com.archspot.ArchSpot_BackEnd.entities;

import com.archspot.ArchSpot_BackEnd.enums.Status;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Table(name = "project")
@Data
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Date dtInitial;
    private String Description;
    private Status status;
}
