package com.pm.contractservice.controller;

import com.pm.contractservice.dto.ContractResponseDTO;
import com.pm.contractservice.dto.FunctionResponseDTO;
import com.pm.contractservice.service.ContractService;
import com.pm.contractservice.service.FunctionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/contract")
@Tag(name = "Contract", description = "API for managing Contracts")
public class ContractController {

    private final ContractService contractService;
    private final FunctionService functionService;

    public ContractController(ContractService contractService, FunctionService functionService) {
        this.contractService = contractService;
        this.functionService = functionService;
    }

    @GetMapping
    @Operation(summary = "Get Contracts")
    public ResponseEntity<List<ContractResponseDTO>> getContracts(){
        List<ContractResponseDTO> contracts = contractService.getContracts();
        return ResponseEntity.ok().body(contracts);
    }

    @GetMapping("/function")
    @Operation(summary = "Get Functions")
    public ResponseEntity<List<FunctionResponseDTO>> getFunctions(){
        List<FunctionResponseDTO> functions = functionService.getFunctions();
        return ResponseEntity.ok().body(functions);
    }
}
