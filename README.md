# RISC-V Simulator for VS Code

[![Download extension](https://img.shields.io/badge/Download-.vsix-blue?style=for-the-badge&logo=visualstudiocode)](https://github.com/LabSirius/RiscVSiriusStudio/releases/download/v0.0.5/rv-simulator-0.0.5.vsix)
[![Version](https://img.shields.io/badge/version-0.0.2-green?style=for-the-badge)](https://github.com/LabSirius/RiscVSiriusStudio/releases)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](LICENSE.md)

An interactive RISC-V assembly simulator with memory views, step execution, and code visualization for Visual Studio Code, primarily designed for educational purposes.

## Educational Purpose

This simulator is specifically targeted for teaching and learning the RISC-V architecture:

- **For Students**: Provides an interactive environment to explore and understand the RISC-V instruction set, memory operations, and program execution flow
- **For Educators**: Offers a powerful tool to demonstrate important computer organization concepts, pipeline stages, and architectural principles
- **For Classrooms**: Enables hands-on learning experiences with immediate visual feedback on program execution

The visual pipeline representation and step-by-step execution make abstract computer architecture concepts tangible and easier to comprehend.

## Features

- **Syntax Highlighting**: Full syntax highlighting for RISC-V assembly (.asm) files
- **Interactive Simulation**: Run and step through RISC-V programs directly in VS Code
- **Visual Pipeline**: Visualize the RISC-V pipeline execution with an interactive diagram
- **Memory Views**: Inspect program memory and data memory during simulation
- **Register Monitoring**: Track register values and changes during execution
- **Code Synchronization**: Keep source code synchronized with program memory
- **Export Options**: Export instruction memory and intermediate representation as JSON

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "RISC-V Simulator"
4. Click Install

### Manual Installation
1. Download the .vsix file from the [Releases page](https://github.com/LabSirius/RiscVSiriusStudio/releases)
2. In VS Code, go to Extensions (Ctrl+Shift+X)
3. Click the "..." menu and select "Install from VSIX..."
4. Select the downloaded .vsix file

## Usage

1. Open or create a RISC-V assembly file (.asm)
2. Use the toolbar buttons or commands to:
   - Build your program (Ctrl+F12)
   - Start simulation
   - Step through execution
   - Stop simulation

### Available Commands

- `RISCV simulator: build program` - Compile your RISC-V assembly code
- `RISCV simulator: simulate program execution` - Start the simulation
- `RISCV simulator: step simulation` - Execute the next instruction
- `RISCV simulator: stop simulation` - Stop the current simulation
- `RISCV simulator: export instruction memory as JSON` - Export program memory
- `RISCV simulator: export intermediate representation as JSON` - Export IR

## Configuration

The extension provides several configuration options:

- **Encoder Update Policy**: Control when the encoder output is updated (On save, On change, Manual)
- **Register View Sorting**: Sort registers by name or last modified time
- **Program Memory View Format**: Display instructions in binary or hexadecimal
- **Data Memory Size**: Configure the size of data memory (128, 256, 512, or 1024 bytes)
- **Stack Pointer Initial Address**: Set the initial address for the stack pointer

Access these settings through VS Code's settings interface under "RISCV Simulator".

## Requirements

- Visual Studio Code version 1.75.0 or higher

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Developed by the Sirius Lab team at Universidad Tecnológica de Pereira
- Special thanks to all contributors who have helped make this extension better
