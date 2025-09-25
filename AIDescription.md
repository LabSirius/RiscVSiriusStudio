# Project Description File

## Project Overview
**Project Name**: RiscVSiriusStudio
**Version**: [In Development - Not Published to Marketplace]
**Repository**: https://github.com/LabSirius/RiscVSiriusStudio
**Organization**: Sirius Lab - Universidad Tecnológica de Pereira
**Last Updated**: [Date]

### Purpose & Vision
An interactive RISC-V assembly simulator with memory views, step execution, and code visualization for Visual Studio Code, primarily designed for educational purposes. The extension makes abstract computer architecture concepts tangible and easier to comprehend through visual representation and step-by-step execution.

### Target Audience
- **Students**: Interactive environment to explore and understand the RISC-V instruction set, memory operations, and program execution flow
- **Educators**: Powerful tool to demonstrate computer organization concepts and architectural principles
- **Classrooms**: Enables hands-on learning experiences with immediate visual feedback on program execution

## Functional Description

### Core Functionality
The extension provides comprehensive simulation and execution capabilities for RISC-V assembly programs:
- **RISC-V RV32IM Support**: Full implementation of the RV32I base instruction set architecture plus the M extension for integer multiplication and division operations
- **Single-Cycle Architecture**: Complete single-cycle RISC-V processor simulation with cycle-by-cycle execution
- **Pipelined Architecture (Beta)**: Advanced pipelined processor simulation included in sources but in beta testing phase
- **Syntax Highlighting**: Full syntax highlighting for RISC-V assembly (.asm) files using custom TextMate grammar
- **Interactive Simulation**: Run and step through RISC-V programs directly in VS Code with both text and graphic simulation modes
- **Memory Views**: Inspect program memory and data memory during simulation with configurable display formats
- **Register Monitoring**: Track register values and changes during execution with sortable views
- **Code Synchronization**: Keep source code synchronized with program memory representation
- **Export Options**: Export instruction memory and intermediate representation as JSON
- **Error Reporting**: Real-time parsing and validation with clear error messages for debugging

### Key Components/Modules
- **Single-Cycle RISC-V Simulator**: Production-ready single-cycle processor simulation implementing RV32IM instruction set
- **Pipelined RISC-V Simulator (Beta)**: Advanced pipelined processor simulation with hazard detection and forwarding logic
- **VS Code Extension Interface**: Complete integration with Visual Studio Code editor, commands, and UI panels (TypeScript + VS Code API)
- **PEG-based Assembly Parser**: Built with Peggy parser generator - parses RISC-V assembly syntax and generates AST
- **Binary Encoder**: Converts parsed AST into corresponding binary machine code representation
- **TextMate Grammar**: Custom grammar definition for RISC-V assembly syntax highlighting in VS Code
- **React Flow Visualization**: Interactive component visualization for graphic simulation mode using React Flow
- **Tabulator Data Tables**: Professional data tables for displaying registers, program memory, and data memory states
- **Memory Management System**: Handles program memory, data memory with configurable sizes and real-time visualization
- **Register State Manager**: Tracks and displays register states with Tabulator-based sortable views
- **Processor Architecture Selector**: Allows switching between single-cycle and pipelined simulation modes
- **Export System**: Provides JSON export functionality for instruction memory and intermediate representations
- **Configuration Manager**: Handles user preferences for simulation behavior and display options
- **React Webview Components**: Custom React components for VS Code webview panels and user interface

### Data Flow & Architecture
The simulation workflow follows these stages:
1. **Input**: User writes RISC-V assembly code in VS Code editor with syntax highlighting (.asm files)
2. **PEG Parsing**: Peggy-generated parser validates syntax and creates Abstract Syntax Tree (AST)
3. **Binary Encoding**: AST is traversed and converted to binary instruction format
4. **Error Handling**: Parser provides detailed error messages with line numbers and syntax issues
5. **Architecture Selection**: User chooses between single-cycle or pipelined simulation modes
6. **Simulation Modes**: Users choose between text simulation or React Flow-based graphic simulation
7. **Execution**: 
   - **Single-Cycle**: Instructions executed one per cycle with complete datapath visualization
   - **Pipelined (Beta)**: Instructions flow through 5-stage pipeline with hazard handling
8. **State Visualization**: 
   - Register states displayed in Tabulator tables with sorting/filtering
   - Memory contents shown in Tabulator grids with multiple format options
   - Program flow visualized using React Flow components in graphic mode
   - Pipeline stage visualization (when using pipelined mode)
9. **Real-time Updates**: All Tabulator tables and React Flow components update during step execution
10. **Export**: Final state exported as JSON for analysis or sharing

### Data Flow & Architecture
High-level description of how data moves through your system and key architectural decisions:
- Input sources and formats
- Processing stages
- Output formats and destinations
- Key architectural patterns used

## Technical Specifications

### Technology Stack
- **Platform**: Visual Studio Code Extension
- **Core Language**: TypeScript
- **UI Framework**: React (for extension webviews)
- **Visualization**: React Flow - for component visualization and graphic simulation interface
- **Data Presentation**: Tabulator (https://tabulator.info/) - for registers, program memory, and data memory tables
- **Parser Generator**: Peggy (https://github.com/peggyjs/peggy) - PEG-based parser for RISC-V assembly syntax
- **Extension Host**: VS Code Extension API
- **File Format**: .asm files for RISC-V assembly source code
- **Grammar**: Custom TextMate grammar for syntax highlighting
- **Export Format**: JSON for instruction memory and intermediate representation

### System Requirements
- Visual Studio Code version 1.75.0 or higher
- Compatible with VS Code on Windows, macOS, and Linux

### Architecture Support
- **RISC-V RV32IM**: Complete support for 32-bit RISC-V base instruction set plus multiplication extension
- **Single-Cycle Processor**: Full single-cycle implementation with cycle-accurate simulation
- **Pipelined Processor (Beta)**: 5-stage pipeline implementation with hazard detection and resolution
- **Registers**: Full 32 general-purpose register simulation
- **Memory**: Configurable data memory sizes (128, 256, 512, up to 1024 bytes)
- **Stack**: Configurable initial stack pointer address

### Simulation Architectures
- **Single-Cycle Mode**: 
  - Each instruction completes in one clock cycle
  - Simple datapath visualization
  - Ideal for teaching basic processor concepts
  - Production-ready and fully tested
  
- **Pipelined Mode (Beta)**:
  - 5-stage pipeline: Instruction Fetch → Instruction Decode → Execute → Memory → Write Back
  - Hazard detection and forwarding logic
  - Pipeline stall visualization
  - Advanced concept demonstration for computer architecture courses
  - Currently in beta testing phase

## Development Context

### Development Principles
- **Educational Focus**: Prioritize clarity and visual feedback for learning RISC-V concepts
- **Type Safety**: Leverage TypeScript for robust code with compile-time error detection
- **Component-Based Architecture**: Use React for modular, reusable UI components
- **Data-Driven Visualization**: Utilize Tabulator for professional data presentation and React Flow for interactive diagrams
- **Parser Reliability**: Employ PEG-based parsing for robust and maintainable assembly language processing
- **Real-time Updates**: Ensure all visualizations update synchronously during simulation
- **Cross-Platform Compatibility**: Support all VS Code platforms (Windows, macOS, Linux)

### Technical Architecture Patterns
- **MVC Separation**: Clear separation between simulation engine (Model), React components (View), and VS Code extension (Controller)
- **Observer Pattern**: Register and memory state changes trigger UI updates across all Tabulator tables
- **Command Pattern**: VS Code commands encapsulate simulation actions (build, run, step, stop)
- **Factory Pattern**: PEG parser generates AST nodes that are processed by instruction factories
- **State Management**: Centralized state management for registers, memory, and program counter

### Code Organization Standards
- **TypeScript Configuration**: Strict type checking with comprehensive type definitions
- **React Component Structure**: Functional components with hooks for state management
- **PEG Grammar Organization**: Modular grammar rules for different instruction types and formats
- **Tabulator Configuration**: Reusable column definitions and formatting functions
- **Error Handling**: Comprehensive error reporting from parser through to UI display

## Current Status & Roadmap

### Completed Features
- [✅ RV32IM Implementation]: Complete support for RISC-V RV32I base instruction set plus M extension
- [✅ Single-Cycle Processor]: Full single-cycle architecture simulation with cycle-accurate execution
- [✅ Syntax Highlighting]: Custom TextMate grammar for .asm files
- [✅ Assembly Parser]: Full parsing and validation of RISC-V assembly syntax using PEG grammar
- [✅ Binary Encoder]: Conversion of assembly instructions to binary format
- [✅ Interactive Simulation]: Both text and graphic simulation modes
- [✅ Memory Visualization]: Program memory and data memory inspection
- [✅ Register Monitoring]: Real-time register state tracking and display
- [✅ Step Execution]: Step-by-step program execution with state updates
- [✅ Export Functionality]: JSON export for instruction memory and intermediate representation
- [✅ Configuration System]: Comprehensive user settings for simulation behavior
- [✅ VS Code Integration]: Full integration with VS Code commands, toolbar, and UI

### In Development/Beta Features
- [🧪 Pipelined Processor]: 5-stage pipeline simulation with hazard detection currently in beta testing
  - Pipeline visualization showing instruction flow through stages
  - Hazard detection and forwarding logic implementation
  - Performance comparison capabilities between single-cycle and pipelined modes
  - Advanced debugging features for pipeline stalls and hazards

### Distribution Status
- [🚧 Marketplace Publication]: Extension ready but not yet published to VS Code Marketplace
- [✅ Manual Installation]: Available via .vsix file from GitHub releases
- [✅ Source Code]: Open source repository available on GitHub

### Known Technical Capabilities
- Configurable data memory sizes (128 to 1024 bytes)
- Multiple display formats for program memory (binary, hex, decimal, ASCII)
- Register view with sorting options (name or last modified)
- Code synchronization between source and program memory
- State import/export functionality
- Configurable stack pointer initialization

## Usage Examples

### Common Use Cases

#### 1. Basic Program Simulation
1. Open or create a RISC-V assembly file (.asm)
2. Write your assembly program with syntax highlighting support
3. Use toolbar buttons or command palette to build the program
4. Start simulation (text or graphic mode)
5. Step through execution or run continuously
6. Monitor register and memory changes

#### 2. Educational Debugging Session
1. Load an assembly program with potential issues
2. Build the program to check for syntax errors
3. Start step-by-step simulation
4. Watch register values change as each instruction executes
5. Inspect memory contents at different addresses
6. Export final state for analysis

### Available Commands
- **RISCV simulator: build program** - Compile your RISC-V assembly code
- **RISCV simulator: text-simulate program execution** - Start the text simulation
- **RISCV simulator: simulate program execution** - Start the graphic simulation  
- **RISCV simulator: step simulation** - Execute the next instruction
- **RISCV simulator: stop simulation** - Stop the current simulation

### Configuration Options
Available through VS Code settings under "RISCV Simulator":
- **Encoder Update Policy**: Control when encoder output updates (On save, On change, Manual)
- **Register View Sorting**: Sort registers by name or last modified time
- **Program Memory View Format**: Display instructions in binary, hexadecimal, decimal, ASCII
- **Data Memory Size**: Configure data memory size (128, 256, 512, up to 1024 bytes)
- **Import Registers and Memory Data**: Load previously saved register and memory state
- **Stack Pointer Initial Address**: Set initial stack pointer address

## Development Guidelines for AI Agents

### When Adding New Features
- Consider impact on existing components
- Follow established patterns and conventions
- Update tests and documentation
- Maintain backward compatibility where possible

### When Debugging or Fixing Issues
- Check related components and dependencies
- Consider performance implications
- Document root cause and solution approach

### When Refactoring
- Preserve existing functionality
- Improve code quality without breaking changes
- Update related documentation

## External Dependencies & Integrations

### Core Dependencies
- **TypeScript**: Primary development language for extension logic and type safety
- **React**: UI framework for webview components and interactive interfaces
- **React Flow**: Interactive node-based visualization library for graphic simulation mode
- **Tabulator**: Feature-rich data tables for registers, program memory, and data memory display
- **Peggy**: PEG parser generator for robust RISC-V assembly syntax parsing

### VS Code Extension Dependencies
- **VS Code Extension API**: Core integration with Visual Studio Code
- **TextMate Grammar System**: For syntax highlighting of .asm files
- **VS Code Webview API**: Hosts React components for simulation interfaces
- **VS Code Command System**: For toolbar buttons and command palette integration
- **VS Code Settings API**: For user configuration management

### File System Integration
- **.asm File Support**: Native handling of RISC-V assembly files
- **JSON Export**: Export functionality for instruction memory and intermediate representation
- **.vsix Distribution**: Standard VS Code extension packaging format

### Library Integration Details
- **Tabulator Configuration**: Custom column definitions for register and memory data presentation
- **React Flow Setup**: Custom node types for RISC-V component visualization
- **Peggy Grammar**: Custom PEG grammar rules for RISC-V RV32IM instruction parsing

## Security & Compliance

### Security Considerations
- Authentication and authorization approach
- Data privacy and protection measures
- Security best practices implemented

### Compliance Requirements
- Relevant standards or regulations
- Data handling requirements

## Performance & Scalability

### Current Performance Metrics
- Response times
- Throughput capabilities
- Resource usage

### Scalability Considerations
- Bottlenecks and scaling strategies
- Load balancing approaches
- Caching strategies

## Testing Strategy

### Testing Approach
- Unit testing coverage goals
- Integration testing strategy
- End-to-end testing approach
- Performance testing requirements

### Test Data & Environments
- Test data sources and management
- Development, staging, and production environments

## Documentation & Resources

### Key Documentation
- **GitHub Repository**: https://github.com/LabSirius/RiscVSiriusStudio
- **Installation Instructions**: Available in repository README
- **Command Reference**: Detailed command descriptions in repository
- **Configuration Guide**: Settings documentation for simulation options

### Project Information
- **License**: MIT License (see LICENSE.md in repository)
- **Development Team**: Sirius Lab - Universidad Tecnológica de Pereira
- **Contribution Guidelines**: Standard GitHub fork/PR workflow
- **Issue Tracking**: GitHub Issues for bug reports and feature requests

### Educational Context
- **Target Course**: Programming Organization / Computer Architecture courses
- **Learning Objectives**: 
  - RISC-V instruction set understanding
  - Assembly programming concepts
  - Single-cycle processor architecture and datapath
  - Pipelined processor concepts and hazard handling (advanced)
  - Performance analysis between different architectures
- **Pedagogical Approach**: 
  - Visual simulation with step-by-step execution for hands-on learning
  - Progressive complexity: start with single-cycle, advance to pipelined concepts
  - Interactive comparison between architectural approaches

---

**AI Agent Instructions**: This extension is designed as an educational tool for teaching RISC-V assembly programming and computer architecture concepts. The project implements both single-cycle (production) and pipelined (beta) processor architectures. When working on this project:

- **Prioritize educational clarity** - ensure visualizations accurately represent computer architecture concepts
- **Single-cycle focus first** - the single-cycle implementation is production-ready and should be the primary reference
- **Handle pipelined features carefully** - pipelined simulator is in beta, so treat it as experimental when making modifications
- **Maintain architectural accuracy** - both simulators should correctly implement RISC-V RV32IM behavior
- **Consider progressive learning** - features should support students learning basic concepts before advanced ones
- **Visual consistency** - ensure React Flow visualizations and Tabulator presentations are consistent between modes
- **Performance considerations** - both simulators should provide meaningful performance insights for educational purposes

Always consider the pedagogical impact of changes and ensure that both architectural implementations remain educationally valuable and technically accurate.