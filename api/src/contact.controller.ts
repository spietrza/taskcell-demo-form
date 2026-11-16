import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateContactDto } from './create-contact.dto.js';

export interface Contact extends CreateContactDto {
  id: number;
}

@Controller('contact')
export class ContactController {
  private readonly contacts: Contact[] = [];

  @Post()
  create(@Body() dto: CreateContactDto): Contact {
    const contact: Contact = { id: this.contacts.length + 1, ...dto };
    this.contacts.push(contact);
    return contact;
  }

  @Get()
  list(): Contact[] {
    return this.contacts;
  }
}
