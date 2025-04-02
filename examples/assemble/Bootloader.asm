.section .text
.global _start

.equ UART_BASE,  0x10000000  # UART memory-mapped address
.equ RAM_BASE,   0x20000000  # Start of RAM
.equ UART_RX,    0x0         # UART receive register offset
.equ UART_TX,    0x0         # UART transmit register offset
.equ UART_STAT,  0x4         # UART status register offset

_start:
    # Print message over UART
    la a0, msg
    call uart_puts

    # Load program into RAM
    li a1, RAM_BASE  # RAM destination address

receive_loop:
    call uart_getc
    sb a0, 0(a1)     # Store received byte into RAM
    addi a1, a1, 1   # Increment RAM address

    # Add termination condition if needed (e.g., specific size)

    j receive_loop

# Jump to the loaded program
jump_to_program:
    li a0, RAM_BASE
    jr a0            # Jump to RAM

# UART: Send a character
uart_putc:
    li a1, UART_BASE
wait_tx:
    lw a2, UART_STAT(a1)
    andi a2, a2, 0x02  # Check TX ready flag
    beqz a2, wait_tx
    sw a0, UART_TX(a1) # Send character
    ret

# UART: Receive a character
uart_getc:
    li a1, UART_BASE
wait_rx:
    lw a2, UART_STAT(a1)
    andi a2, a2, 0x01  # Check RX ready flag
    beqz a2, wait_rx
    lw a0, UART_RX(a1) # Read character
    ret

# UART: Print string
uart_puts:
    lb a0, 0(a1)
    beqz a0, end_puts
    call uart_putc
    addi a1, a1, 1
    j uart_puts
end_puts:
    ret

.section .rodata
msg:
    .asciz "UART Bootloader Ready\n"
