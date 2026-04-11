namespace Selu383.SP26.Api.Features.Reservations;

public class ReservationAvailabilityDto
{
    public int LocationId { get; set; }
    public DateOnly Date { get; set; }
    public int TotalTables { get; set; }
    public List<ReservationTimeSlotDto> TimeSlots { get; set; } = new();
}

public class ReservationTimeSlotDto
{
    public TimeOnly Time { get; set; }
    public int AvailableTables { get; set; }
    public bool IsAvailable { get; set; }
}
